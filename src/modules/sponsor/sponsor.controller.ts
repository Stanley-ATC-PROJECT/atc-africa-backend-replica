/* eslint-disable prettier/prettier */
import {
  Controller,
  Delete,
  Get,
  Post,
  Body,
  Req,
  Param,
  Patch,
  Query,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { SponsorService } from './sponsor.service';
import { CreateSponsorDto } from 'src/modules/event/dto/create-sponsor.dto';
import { UpdateSponsorDto } from 'src/modules/event/dto/update-sponsor.dto';
import { SponsorPaginationQueryDto } from './dto/sponsor-pagination-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Request } from 'express';
import { AuthenticatedUser } from 'src/modules/auth/types/authenticated-user.interface';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('sponsor')
export class SponsorController {
  constructor(private readonly sponsorService: SponsorService) {}

  // ========== CRUD Operations ==========
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Post()
  async create(@Body() dto: CreateSponsorDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    if (!user?.id) throw new UnauthorizedException();
    const sponsor = await this.sponsorService.create(dto);
    return ResponseDto.createSuccessResponse(
      'Sponsor created successfully',
      sponsor,
    );
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('sponsors:all')
  @CacheTTL(3600) // Cache for 1 hour
  async findAll(@Query() query: SponsorPaginationQueryDto) {
    const { items, total, page, pageSize } =
      await this.sponsorService.findAll(query);
    return ResponseDto.createPaginatedResponse(
      'Sponsors fetched successfully',
      items,
      { total, page, pageSize },
    );
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600) // Cache for 1 hour
  async findOne(@Param('id') id: string) {
    const sponsor = await this.sponsorService.findOne(id);
    return ResponseDto.createSuccessResponse(
      'Sponsor fetched successfully',
      sponsor,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSponsorDto) {
    const sponsor = await this.sponsorService.update(id, dto);
    return ResponseDto.createSuccessResponse(
      'Sponsor updated successfully',
      sponsor,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.sponsorService.remove(id);
    return ResponseDto.createSuccessResponse(
      'Sponsor deleted successfully',
      result,
    );
  }
}
