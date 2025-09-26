import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from '../../user.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ResponseDto } from '../../../../common/dto/response.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UpdateUserPasswordAdminDto } from './dto/update-user-admin.dto';
import { BulkUserOperationDto } from './dto/update-user-admin.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(
    @Query('role') role?: UserRole,
    @Query('is_active') isActive?: string,
  ) {
    const users = await this.userService.findAll();

    // Filter by role if provided
    let filteredUsers = users;
    if (role) {
      filteredUsers = users.filter((user) => user.role === role);
    }

    // Filter by active status if provided
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredUsers = filteredUsers.filter(
        (user) => user.is_active === activeFilter,
      );
    }

    return ResponseDto.createSuccessResponse(
      'Users fetched successfully',
      filteredUsers,
    );
  }

  @Get('stats')
  async getUserStats() {
    const stats = await this.userService.getUserStats();
    return ResponseDto.createSuccessResponse(
      'User statistics fetched successfully',
      stats,
    );
  }

  @Get('by-role/:role')
  async getUsersByRole(@Param('role') role: UserRole) {
    const users = await this.userService.findByRole(role);
    return ResponseDto.createSuccessResponse(
      `Users with role ${role} fetched successfully`,
      users,
    );
  }

  @Get('search')
  async searchUsers(@Query('q') searchTerm: string) {
    const users = await this.userService.searchUsers(searchTerm);
    return ResponseDto.createSuccessResponse('User search results', users);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return ResponseDto.createSuccessResponse('User fetched successfully', user);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserAdminDto,
  ) {
    const user = await this.userService.update(id, updateUserDto);
    return ResponseDto.createSuccessResponse('User updated successfully', user);
  }

  @Patch(':id/password')
  async updateUserPassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdateUserPasswordAdminDto,
  ) {
    await this.userService.updatePassword(id, updatePasswordDto.newPassword);
    return ResponseDto.createSuccessResponse(
      'User password updated successfully',
    );
  }

  @Patch(':id/role')
  async changeUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    const user = await this.userService.changeUserRole(id, role);
    return ResponseDto.createSuccessResponse(
      'User role changed successfully',
      user,
    );
  }

  @Patch(':id/activate')
  async activateUser(@Param('id') id: string) {
    const result = await this.userService.activateUser(id);
    return ResponseDto.createSuccessResponse(
      'User activated successfully',
      result,
    );
  }

  @Patch(':id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    const result = await this.userService.deactivateUser(id);
    return ResponseDto.createSuccessResponse(
      'User deactivated successfully',
      result,
    );
  }

  @Post('bulk/activate')
  async bulkActivateUsers(@Body() bulkOperationDto: BulkUserOperationDto) {
    const results: any[] = [];
    for (const userId of bulkOperationDto.userIds) {
      try {
        const result = await this.userService.activateUser(userId);
        results.push({ userId, status: 'success', result });
      } catch (error) {
        results.push({ userId, status: 'error', error: error.message });
      }
    }
    return ResponseDto.createSuccessResponse(
      'Bulk activation completed',
      results,
    );
  }

  @Post('bulk/deactivate')
  async bulkDeactivateUsers(@Body() bulkOperationDto: BulkUserOperationDto) {
    const results: any[] = [];
    for (const userId of bulkOperationDto.userIds) {
      try {
        const result = await this.userService.deactivateUser(userId);
        results.push({ userId, status: 'success', result });
      } catch (error) {
        results.push({ userId, status: 'error', error: error.message });
      }
    }
    return ResponseDto.createSuccessResponse(
      'Bulk deactivation completed',
      results,
    );
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.remove(id);
    return ResponseDto.createSuccessResponse(
      'User deleted successfully',
      result,
    );
  }
}
