import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DataFormatter } from '../../utils/helpers/data-formatter';
import { NotificationService } from '../../utils/notification/notification.service';
import { EmailType } from '../../utils/notification/email/email.enum';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password_hash'>> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Create user
    const { password, ...userData } = createUserDto;
    const user = await this.userRepository.create({
      ...userData,
      password_hash: hashedPassword,
      notificationEmail: userData.notificationEmail,
    });

    // Send welcome email asynchronously
    await this.notificationService.sendEmailNotification(
      {
        to: user.notificationEmail,
        type: EmailType.WELCOME,
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { priority: 1 },
    );

    return DataFormatter.formatObject(user, ['password_hash']);
  }

  async findAll(): Promise<Omit<User, 'password_hash'>[]> {
    let users: User[];
    users = await this.userRepository.findMany({
      orderBy: { created_at: 'desc' },
    });
    return users.map((user) =>
      DataFormatter.formatObject(user, ['password_hash']),
    );
  }

  async findAllWithFilters(query: UserQueryDto): Promise<{
    items: Omit<User, 'password_hash'>[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.limit ?? 10);
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (typeof query.is_active === 'boolean') {
      where.is_active = query.is_active;
    }
    if (query.role) {
      where.role = query.role;
    }
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderByField = query.orderBy || 'created_at';
    const orderDirection = (query.order || 'ASC').toLowerCase() as
      | 'asc'
      | 'desc';

    const [users, total] = await Promise.all([
      this.userRepository.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { [orderByField]: orderDirection },
      }),
      this.userRepository.count(where),
    ]);

    return {
      items: users.map((user) =>
        DataFormatter.formatObject(user, ['password_hash']),
      ),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return DataFormatter.formatObject(user, ['password_hash']);
  }

  async findById(
    id: string,
    withPassword: boolean = false,
  ): Promise<Omit<User, 'password_hash'> | User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    return withPassword
      ? user
      : DataFormatter.formatObject(user, ['password_hash']);
  }

  async findByEmail(
    email: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }
    return DataFormatter.formatObject(user, ['password_hash']);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto & { hasChangePassword?: boolean },
  ): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userRepository.emailExists(
        updateUserDto.email,
      );
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    return DataFormatter.formatObject(updatedUser, ['password_hash']);
  }

  async remove(id: string): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deletedUser = await this.userRepository.delete(id);
    return DataFormatter.formatObject(deletedUser, ['password_hash']);
  }

  // Authentication-related methods
  async validatePassword(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    return DataFormatter.formatObject(user, ['password_hash']);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.updatePassword(id, hashedPassword);
  }

  // Role-based methods
  async findByRole(role: UserRole): Promise<Omit<User, 'password_hash'>[]> {
    const users = await this.userRepository.findByRole(role);
    return users.map((user) =>
      DataFormatter.formatObject(user, ['password_hash']),
    );
  }

  async changeUserRole(
    id: string,
    role: UserRole,
  ): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.userRepository.changeUserRole(id, role);
    return DataFormatter.formatObject(updatedUser, ['password_hash']);
  }

  // Utility methods
  async activateUser(id: string): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const activatedUser = await this.userRepository.activateUser(id);
    return DataFormatter.formatObject(activatedUser, ['password_hash']);
  }

  async deactivateUser(id: string): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deactivatedUser = await this.userRepository.deactivateUser(id);
    return DataFormatter.formatObject(deactivatedUser, ['password_hash']);
  }

  async searchUsers(
    searchTerm: string,
  ): Promise<Omit<User, 'password_hash'>[]> {
    const users = await this.userRepository.searchUsers(searchTerm);
    return users.map((user) =>
      DataFormatter.formatObject(user, ['password_hash']),
    );
  }

  async getUserStats() {
    const [totalUsers, activeUsers, usersByRole, recentUsers] =
      await Promise.all([
        this.userRepository.getUserCount(),
        this.userRepository.getActiveUserCount(),
        this.userRepository.getUserCountByRole(),
        this.userRepository.getRecentUsers(7),
      ]);

    return {
      totalUsers,
      activeUsers,
      usersByRole,
      recentUsers: recentUsers.map((user) =>
        DataFormatter.formatObject(user, ['password_hash']),
      ),
    };
  }

  // Password reset methods
  async updatePasswordResetToken(
    id: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.userRepository.createPasswordResetToken(id, token, expires);
  }

  async findByPasswordResetToken(
    token: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userRepository.findUserByValidResetToken(token);
    if (!user) {
      return null;
    }
    return DataFormatter.formatObject(user, ['password_hash']);
  }

  async updatePasswordAndClearResetToken(
    id: string,
    hashedPassword: string,
  ): Promise<void> {
    await this.userRepository.updatePasswordAndClearResetTokens(
      id,
      hashedPassword,
    );
  }
}
