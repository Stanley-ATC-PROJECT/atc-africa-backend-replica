import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import { UserRole } from '@prisma/client';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.userService.findAllWithFilters(query);
    return ResponseDto.createPaginatedResponse(
      'Users fetched successfully',
      result.items,
      {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getOwnProfile(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.userService.findOne(user.id);
    return ResponseDto.createSuccessResponse(
      'Profile fetched successfully',
      profile,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return ResponseDto.createSuccessResponse('User fetched successfully', user);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateOwnProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.userService.update(user.id, updateUserDto);
    return ResponseDto.createSuccessResponse(
      'Profile updated successfully',
      updated,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.userService.update(id, updateUserDto);
    return ResponseDto.createSuccessResponse(
      'User updated successfully',
      updated,
    );
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async changeUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    const result = await this.userService.changeUserRole(id, role);
    return ResponseDto.createSuccessResponse(
      'User role changed successfully',
      result,
    );
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async activateUser(@Param('id') id: string) {
    const result = await this.userService.activateUser(id);
    return ResponseDto.createSuccessResponse(
      'User activated successfully',
      result,
    );
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async deactivateUser(@Param('id') id: string) {
    const result = await this.userService.deactivateUser(id);
    return ResponseDto.createSuccessResponse(
      'User deactivated successfully',
      result,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  async remove(@Param('id') id: string) {
    const result = await this.userService.remove(id);
    return ResponseDto.createSuccessResponse(
      'User deleted successfully',
      result,
    );
  }
}
