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
import { EventSponsorService } from './event-sponsor.service';
import { AddEventSponsorDto } from './dto/add-event-sponsor.dto';
import { UpdateEventSponsorDto } from './dto/update-event-sponsor.dto';
import { EventSponsorPaginationQueryDto } from './dto/event-sponsor-pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ResponseDto } from 'src/common/dto/response.dto';

@Controller('event-sponsor')
export class EventSponsorController {
  constructor(private readonly eventSponsorService: EventSponsorService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Get('most-active-sponsors')
  async getMostActiveSponsors(@Query('limit') limit?: number) {
    const sponsors = await this.eventSponsorService.getMostActiveSponsors(
      limit ? Number(limit) : 10,
    );
    return ResponseDto.createSuccessResponse(
      'Most active sponsors fetched successfully',
      sponsors,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Get('top-events-by-sponsors')
  async getTopEventsBySponsors(@Query('limit') limit?: number) {
    const events = await this.eventSponsorService.getTopEventsBySponsors(
      limit ? Number(limit) : 10,
    );
    return ResponseDto.createSuccessResponse(
      'Top events by sponsor count fetched successfully',
      events,
    );
  }

  // ==================== RELATIONSHIP CRUD ENDPOINTS ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Post()
  async addSponsorToEvent(@Body() dto: AddEventSponsorDto) {
    const relationship = await this.eventSponsorService.addSponsorToEvent(dto);
    return ResponseDto.createSuccessResponse(
      'Sponsor added to event successfully',
      relationship,
    );
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('event-sponsors:all')
  @CacheTTL(1800) // Cache for 30 minutes
  async findAllEventSponsors(@Query() query: EventSponsorPaginationQueryDto) {
    const { items, total, page, pageSize } =
      await this.eventSponsorService.findAllEventSponsors(query);
    return ResponseDto.createPaginatedResponse(
      'Event-sponsor relationships fetched successfully',
      items,
      { total, page, pageSize },
    );
  }

  @Get('event/:eventId/sponsors')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800) // Cache for 30 minutes
  async findSponsorsForEvent(@Param('eventId') eventId: string) {
    const sponsors =
      await this.eventSponsorService.findSponsorsForEvent(eventId);
    return ResponseDto.createSuccessResponse(
      'Sponsors for event fetched successfully',
      sponsors,
    );
  }

  @Get('sponsor/:sponsorId/events')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800) // Cache for 30 minutes
  async findEventsForSponsor(@Param('sponsorId') sponsorId: string) {
    const events =
      await this.eventSponsorService.findEventsForSponsor(sponsorId);
    return ResponseDto.createSuccessResponse(
      'Events for sponsor fetched successfully',
      events,
    );
  }

  @Get('event/:eventId/sponsor/:sponsorId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1800) // Cache for 30 minutes
  async findOneEventSponsor(
    @Param('eventId') eventId: string,
    @Param('sponsorId') sponsorId: string,
  ) {
    const relationship = await this.eventSponsorService.findOneEventSponsor(
      eventId,
      sponsorId,
    );
    return ResponseDto.createSuccessResponse(
      'Event-sponsor relationship fetched successfully',
      relationship,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Patch('event/:eventId/sponsor/:sponsorId')
  async updateEventSponsor(
    @Param('eventId') eventId: string,
    @Param('sponsorId') sponsorId: string,
    @Body() dto: UpdateEventSponsorDto,
  ) {
    const relationship = await this.eventSponsorService.updateEventSponsor(
      eventId,
      sponsorId,
      dto,
    );
    return ResponseDto.createSuccessResponse(
      'Event-sponsor relationship updated successfully',
      relationship,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Delete('event/:eventId/sponsor/:sponsorId')
  async removeSponsorFromEvent(
    @Param('eventId') eventId: string,
    @Param('sponsorId') sponsorId: string,
  ) {
    const result = await this.eventSponsorService.removeSponsorFromEvent(
      eventId,
      sponsorId,
    );
    return ResponseDto.createSuccessResponse(
      'Sponsor removed from event successfully',
      result,
    );
  }
}
