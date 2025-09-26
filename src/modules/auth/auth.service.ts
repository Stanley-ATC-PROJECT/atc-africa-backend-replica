import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  JwtPayload,
  LoginResponse,
} from '../../common/interfaces/auth.interface';
import { User } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { NotificationService } from '../../utils/notification/notification.service';
import { EmailType } from '../../utils/notification/email/email.enum';
import { DataFormatter } from 'src/utils/helpers/data-formatter';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'src/utils/config/env.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    registerDto: RegisterDto,
    { autoApprove, admin }: { autoApprove: boolean; admin: User | null } = {
      autoApprove: false,
      admin: null,
    },
  ) {
    // Create the user using UserService
    const user = await this.userService.create({
      ...registerDto,
      is_active: autoApprove ? true : undefined,
    });
    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Validate user credentials
    const user = await this.userService.validatePassword(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new ForbiddenException(
        'Account is inactive. Please contact administrator.',
      );
    }

    // User is automatically approved since we removed approval system

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.validatePassword(email, password);
    if (user) {
      return user;
    }
    return null;
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.is_active) {
      throw new ForbiddenException('Account is inactive');
    }

    // User is automatically approved since we removed approval system

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    if (!user.is_active) {
      throw new ForbiddenException('Account is inactive');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token in dedicated table
    await this.userService.updatePasswordResetToken(
      user.id,
      resetToken,
      resetExpires,
    );

    // Send password reset email
    await this.notificationService.sendEmailNotification(
      {
        to: user.notificationEmail || user.email,
        type: EmailType.PASSWORD_RESET,
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          resetToken,
          // resetUrl: `${this.configService.get(ENV.FRONTEND_URL) || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
        },
      },
      { priority: 1 },
    );

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userService.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Expiration is enforced in repository lookup

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token(s)
    await this.userService.updatePasswordAndClearResetToken(
      user.id,
      hashedPassword,
    );

    // update has change password to true
    if (!user.hasChangePassword) {
      await this.userService.update(user.id, {
        hasChangePassword: true,
      });
    }
    return { message: 'Password has been reset successfully' };
  }

  async sendInitialCredentials(
    user: {
      notificationEmail: string;
      email: string;
      firstName: string;
      lastName: string;
    },
    temporaryPassword: string,
  ) {
    await this.notificationService.sendEmailNotification(
      {
        to: user.notificationEmail || user.email,
        type: EmailType.INITIAL_CREDENTIALS,
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          temporaryPassword,
          loginUrl: `${this.configService.get(ENV.FRONTEND_URL) || 'http://localhost:3000'}/login`,
          changePasswordUrl: `${this.configService.get(ENV.FRONTEND_URL) || 'http://localhost:3000'}/change-password`,
        },
      },
      { priority: 1 },
    );
  }
}
