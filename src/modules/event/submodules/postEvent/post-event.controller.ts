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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { PostEventService } from './post-event.service';
import { CreateEventHighlightDto } from './dto/create-event-highlight.dto';
import { UpdateEventHighlightDto } from './dto/update-event-highlight.dto';
import { CreateSocialMediaMentionDto } from './dto/create-social-media-mention.dto';
import { UpdateSocialMediaMentionDto } from './dto/update-social-media-mention.dto';
import { PostEventPaginationQueryDto } from './dto/post-event-pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('post-event')
export class PostEventController {
  constructor(private readonly postEventService: PostEventService) {}

  // ==================== EVENT HIGHLIGHTS ENDPOINTS ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Post('highlight')
  async createEventHighlight(@Body() dto: CreateEventHighlightDto) {
    const highlight = await this.postEventService.createEventHighlight(dto);
    return ResponseDto.createSuccessResponse(
      'Event highlight created successfully',
      highlight,
    );
  }

  @Get('highlight')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('event-highlights:all')
  @CacheTTL(1800) // Cache for 30 minutes
  async findAllEventHighlights(@Query() query: PostEventPaginationQueryDto) {
    const { items, total, page, pageSize } =
      await this.postEventService.findAllEventHighlights(query);
    return ResponseDto.createPaginatedResponse(
      'Event highlights fetched successfully',
      items,
      { total, page, pageSize },
    );
  }

  @Get('highlight/:eventId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800) // Cache for 30 minutes
  async findEventHighlight(@Param('eventId') eventId: string) {
    const highlight = await this.postEventService.findEventHighlight(eventId);
    return ResponseDto.createSuccessResponse(
      'Event highlight fetched successfully',
      highlight,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Patch('highlight/:eventId')
  async updateEventHighlight(
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventHighlightDto,
  ) {
    const highlight = await this.postEventService.updateEventHighlight(
      eventId,
      dto,
    );
    return ResponseDto.createSuccessResponse(
      'Event highlight updated successfully',
      highlight,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Delete('highlight/:eventId')
  async deleteEventHighlight(@Param('eventId') eventId: string) {
    const result = await this.postEventService.deleteEventHighlight(eventId);
    return ResponseDto.createSuccessResponse(
      'Event highlight deleted successfully',
      result,
    );
  }

  // ==================== SOCIAL MEDIA MENTIONS ENDPOINTS ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Post('mention')
  async createSocialMediaMention(@Body() dto: CreateSocialMediaMentionDto) {
    const mention = await this.postEventService.createSocialMediaMention(dto);
    return ResponseDto.createSuccessResponse(
      'Social media mention created successfully',
      mention,
    );
  }

  @Get('social-mention')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('social-mentions:all')
  @CacheTTL(900) // Cache for 15 minutes
  async findAllSocialMediaMentions(
    @Query() query: PostEventPaginationQueryDto,
  ) {
    const { items, total, page, pageSize } =
      await this.postEventService.findAllSocialMediaMentions(query);
    return ResponseDto.createPaginatedResponse(
      'Social media mentions fetched successfully',
      items,
      { total, page, pageSize },
    );
  }

  @Get('social-mention/event/:eventId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(900) // Cache for 15 minutes
  async findSocialMediaMentionsByEvent(
    @Param('eventId') eventId: string,
    @Query() query: PostEventPaginationQueryDto,
  ) {
    const { items, total, page, pageSize } =
      await this.postEventService.findSocialMediaMentionsByEvent(
        eventId,
        query,
      );
    return ResponseDto.createPaginatedResponse(
      'Social media mentions for event fetched successfully',
      items,
      { total, page, pageSize },
    );
  }

  @Get('social-mention/:id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(900) // Cache for 15 minutes
  async findOneSocialMediaMention(@Param('id') id: string) {
    const mention = await this.postEventService.findOneSocialMediaMention(id);
    return ResponseDto.createSuccessResponse(
      'Social media mention fetched successfully',
      mention,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Patch('social-mention/:id')
  async updateSocialMediaMention(
    @Param('id') id: string,
    @Body() dto: UpdateSocialMediaMentionDto,
  ) {
    const mention = await this.postEventService.updateSocialMediaMention(
      id,
      dto,
    );
    return ResponseDto.createSuccessResponse(
      'Social media mention updated successfully',
      mention,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Delete('social-mention/:id')
  async deleteSocialMediaMention(@Param('id') id: string) {
    const result = await this.postEventService.deleteSocialMediaMention(id);
    return ResponseDto.createSuccessResponse(
      'Social media mention deleted successfully',
      result,
    );
  }
}
