/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User, UserRole } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Basic CRUD operations
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, where, orderBy } = params || {};
    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  // User-specific utility methods
  async findByRole(role: UserRole): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { role },
      orderBy: { created_at: 'desc' },
    });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findInactiveUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { is_active: false },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAdmins(): Promise<User[]> {
    return this.findByRole(UserRole.admin);
  }

  async findCommunityManagers(): Promise<User[]> {
    return this.findByRole(UserRole.community_manager);
  }

  async findOrganizers(): Promise<User[]> {
    return this.findByRole(UserRole.organizer);
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async activateUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { is_active: true },
    });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async changeUserRole(id: string, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { password_hash: passwordHash },
    });
  }

  async updateUserMetadata(id: string, metadata: any): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { user_metadata: metadata },
    });
  }

  // Methods with relations
  async findWithEvents(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        organized_events: {
          include: {
            speakers: {
              include: {
                speaker: true,
              },
            },
            sponsors: {
              include: {
                sponsor: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  async findWithOrganizedEvents(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        organized_events: {
          orderBy: { event_date: 'desc' },
        },
      },
    });
  }

  // Statistics and analytics methods
  async getUserCount(): Promise<number> {
    return this.prisma.user.count();
  }

  async getActiveUserCount(): Promise<number> {
    return this.prisma.user.count({
      where: { is_active: true },
    });
  }

  async getUserCountByRole(): Promise<Record<UserRole, number>> {
    const roles = Object.values(UserRole);
    const counts = await Promise.all(
      roles.map(async (role) => {
        const count = await this.prisma.user.count({
          where: { role },
        });
        return { role, count };
      }),
    );

    return counts.reduce(
      (acc, { role, count }) => {
        acc[role] = count;
        return acc;
      },
      {} as Record<UserRole, number>,
    );
  }

  async getRecentUsers(days = 7): Promise<User[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return this.prisma.user.findMany({
      where: {
        created_at: {
          gte: dateThreshold,
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Validation methods
  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  async isUserActive(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { is_active: true },
    });
    return user?.is_active ?? false;
  }

  async hasRole(id: string, role: UserRole): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    return user?.role === role;
  }

  // Bulk operations
  async bulkActivate(ids: string[]): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { is_active: true },
    });
  }

  async bulkDeactivate(ids: string[]): Promise<void> {
    await this.prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { is_active: false },
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.prisma.user.deleteMany({
      where: { id: { in: ids } },
    });
  }

  // Password reset methods (using PasswordResetToken table)
  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    // Remove any existing tokens for this user first
    await this.prisma.passwordResetToken.deleteMany({ where: { userId } });
    await this.prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
  }

  async findUserByValidResetToken(token: string): Promise<User | null> {
    const prt = await this.prisma.passwordResetToken.findFirst({
      where: { token },
      include: { user: true },
    });
    if (!prt) return null;
    if (prt.expiresAt <= new Date()) return null;
    return prt.user;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await this.prisma.passwordResetToken
      .delete({ where: { token } })
      .catch(() => undefined);
  }

  async deleteAllPasswordResetTokensForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({ where: { userId } });
  }

  async updatePasswordAndClearResetTokens(
    id: string,
    hashedPassword: string,
  ): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        password_hash: hashedPassword,
        is_initial_password: false,
      },
    });
    await this.deleteAllPasswordResetTokensForUser(id);
    return updated;
  }
}
