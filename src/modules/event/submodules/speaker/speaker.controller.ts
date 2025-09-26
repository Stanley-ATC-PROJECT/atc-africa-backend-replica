/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SpeakerService } from './speaker.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { SpeakerPaginationQueryDto } from './dto/speaker-pagination-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../../../auth/types/authenticated-user.interface';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('speaker')
export class SpeakerController {
  constructor(private readonly speakerService: SpeakerService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Get()
  async findAll(@Query() query: SpeakerPaginationQueryDto) {
    const { items, total, page, pageSize } =
      await this.speakerService.findAll(query);
    return ResponseDto.createPaginatedResponse(
      'Speakers fetched successfully',
      items,
      { total, page, pageSize },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Post()
  async create(@Body() dto: CreateSpeakerDto, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    if (!user?.id) throw new UnauthorizedException();
    const speaker = await this.speakerService.create({
      ...dto,
    });
    return ResponseDto.createSuccessResponse(
      'Speaker created successfully',
      speaker,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const speaker = await this.speakerService.findOne(id);
    return ResponseDto.createSuccessResponse(
      'Speaker fetched successfully',
      speaker,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSpeakerDto) {
    const speaker = await this.speakerService.update(id, dto);
    return ResponseDto.createSuccessResponse(
      'Speaker updated successfully',
      speaker,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.speakerService.remove(id);
    return ResponseDto.createSuccessResponse(
      'Speaker deleted successfully',
      result,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Get(':id/events')
  async findSpeakerEvents(@Param('id') id: string) {
    const speaker = await this.speakerService.findWithEvents(id);
    return ResponseDto.createSuccessResponse(
      'Speaker events fetched successfully',
      speaker,
    );
  }
}
