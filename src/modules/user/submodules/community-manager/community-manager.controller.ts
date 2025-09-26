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
import { UpdateOrganizerDto } from './dto/update-organizer.dto';
import { UpdateOrganizerPasswordDto } from './dto/update-organizer.dto';
import { BulkOrganizerOperationDto } from './dto/update-organizer.dto';

@Controller('community-manager/organizers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.community_manager)
export class CommunityManagerController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllOrganizers(@Query('is_active') isActive?: string) {
    const users = await this.userService.findByRole(UserRole.organizer);
    let filteredUsers = users;
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredUsers = filteredUsers.filter(
        (user) => user.is_active === activeFilter,
      );
    }
    return ResponseDto.createSuccessResponse(
      'Organizers fetched successfully',
      filteredUsers,
    );
  }

  @Get('stats')
  async getOrganizerStats() {
    const organizers = await this.userService.findByRole(UserRole.organizer);
    const stats = {
      totalOrganizers: organizers.length,
      activeOrganizers: organizers.filter((org) => org.is_active).length,
      inactiveOrganizers: organizers.filter((org) => !org.is_active).length,
    } as any;
    return ResponseDto.createSuccessResponse(
      'Organizer statistics fetched successfully',
      stats,
    );
  }

  @Get('search')
  async searchOrganizers(@Query('q') searchTerm: string) {
    const allUsers = await this.userService.searchUsers(searchTerm);
    // Filter to only show organizers
    const organizers = allUsers.filter(
      (user) => user.role === UserRole.organizer,
    );

    return ResponseDto.createSuccessResponse(
      'Organizer search results',
      organizers,
    );
  }

  @Get(':id')
  async getOrganizerById(@Param('id') id: string) {
    const user = await this.userService.findOne(id);

    // Ensure the user is an organizer
    if (user.role !== UserRole.organizer) {
      throw new Error('User is not an organizer');
    }

    return ResponseDto.createSuccessResponse(
      'Organizer fetched successfully',
      user,
    );
  }

  @Patch(':id')
  async updateOrganizer(
    @Param('id') id: string,
    @Body() updateOrganizerDto: UpdateOrganizerDto,
  ) {
    // First check if user is an organizer
    const existingUser = await this.userService.findOne(id);
    if (existingUser.role !== UserRole.organizer) {
      throw new Error('User is not an organizer');
    }

    const user = await this.userService.update(id, updateOrganizerDto);
    return ResponseDto.createSuccessResponse(
      'Organizer updated successfully',
      user,
    );
  }

  @Patch(':id/password')
  async updateOrganizerPassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdateOrganizerPasswordDto,
  ) {
    // First check if user is an organizer
    const existingUser = await this.userService.findOne(id);
    if (existingUser.role !== UserRole.organizer) {
      throw new Error('User is not an organizer');
    }

    await this.userService.updatePassword(id, updatePasswordDto.newPassword);
    return ResponseDto.createSuccessResponse(
      'Organizer password updated successfully',
    );
  }

  @Patch(':id/activate')
  async activateOrganizer(@Param('id') id: string) {
    // First check if user is an organizer
    const existingUser = await this.userService.findOne(id);
    if (existingUser.role !== UserRole.organizer) {
      throw new Error('User is not an organizer');
    }

    const result = await this.userService.activateUser(id);
    return ResponseDto.createSuccessResponse(
      'Organizer activated successfully',
      result,
    );
  }

  @Patch(':id/deactivate')
  async deactivateOrganizer(@Param('id') id: string) {
    // First check if user is an organizer
    const existingUser = await this.userService.findOne(id);
    if (existingUser.role !== UserRole.organizer) {
      throw new Error('User is not an organizer');
    }

    const result = await this.userService.deactivateUser(id);
    return ResponseDto.createSuccessResponse(
      'Organizer deactivated successfully',
      result,
    );
  }

  @Post('bulk/activate')
  async bulkActivateOrganizers(
    @Body() bulkOperationDto: BulkOrganizerOperationDto,
  ) {
    const results: any[] = [];
    for (const userId of bulkOperationDto.userIds) {
      try {
        // Check if user is an organizer first
        const existingUser = await this.userService.findOne(userId);
        if (existingUser.role !== UserRole.organizer) {
          results.push({
            userId,
            status: 'error',
            error: 'User is not an organizer',
          });
          continue;
        }

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
  async bulkDeactivateOrganizers(
    @Body() bulkOperationDto: BulkOrganizerOperationDto,
  ) {
    const results: any[] = [];
    for (const userId of bulkOperationDto.userIds) {
      try {
        // Check if user is an organizer first
        const existingUser = await this.userService.findOne(userId);
        if (existingUser.role !== UserRole.organizer) {
          results.push({
            userId,
            status: 'error',
            error: 'User is not an organizer',
          });
          continue;
        }

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
  async deleteOrganizer(@Param('id') id: string) {
    // First check if user is an organizer
    const existingUser = await this.userService.findOne(id);
    if (existingUser.role !== UserRole.organizer) {
      throw new Error('User is not an organizer');
    }

    const result = await this.userService.remove(id);
    return ResponseDto.createSuccessResponse(
      'Organizer deleted successfully',
      result,
    );
  }
}
