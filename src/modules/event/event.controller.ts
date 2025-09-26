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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { EventService } from './services/event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UploadFlyerDto } from './dto/upload-flyer.dto';
import { EventPaginationQueryDto } from './dto/event-pagination-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { ResponseDto } from 'src/common/dto/response.dto';
import { MulterFile } from 'src/common/interfaces/multer-file.interface';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // Removed explicit range endpoint; range handled via query params in findAll

  // Organizer creates event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.organizer)
  @Post()
  @UseInterceptors(FileInterceptor('flyer'))
  async create(
    @Body() dto: CreateEventDto,
    @Req() req: Request,
    @UploadedFile() file?: MulterFile,
  ) {
    const user = req.user as AuthenticatedUser;

    let flyerImageUrl = dto.flyer_image;

    // If a file is uploaded, use the storage service to upload it
    if (file) {
      const uploadResult = await this.eventService.uploadFlyer(file, {
        folder: 'events',
      });
      flyerImageUrl = uploadResult.url;
    }

    const event = await this.eventService.create({
      ...dto,
      flyer_image: flyerImageUrl,
      organizer: { connect: { id: user.id } },
    });
    return ResponseDto.createSuccessResponse(
      'Event created successfully',
      event,
    );
  }

  // Upload flyer image
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.organizer, UserRole.admin, UserRole.community_manager)
  @Post('upload-flyer')
  @UseInterceptors(FileInterceptor('flyer'))
  async uploadFlyer(
    @UploadedFile() file: MulterFile,
    @Body() uploadFlyerDto: UploadFlyerDto,
  ) {
    if (!file) {
      throw new BadRequestException('No flyer image file provided');
    }

    const uploadResult = await this.eventService.uploadFlyer(file, {
      folder: uploadFlyerDto.folder,
      fileName: uploadFlyerDto.fileName,
    });

    return ResponseDto.createSuccessResponse(
      'Flyer uploaded successfully',
      uploadResult,
    );
  }

  // Update event flyer
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.organizer, UserRole.admin, UserRole.community_manager)
  @Post(':id/flyer')
  @UseInterceptors(FileInterceptor('flyer'))
  async updateEventFlyer(
    @Param('id') id: string,
    @UploadedFile() file: MulterFile,
    @Body() uploadFlyerDto: UploadFlyerDto,
  ) {
    if (!file) {
      throw new BadRequestException('No flyer image file provided');
    }

    const result = await this.eventService.uploadAndUpdateFlyer(id, file, {
      folder: uploadFlyerDto.folder,
      fileName: uploadFlyerDto.fileName,
    });

    return ResponseDto.createSuccessResponse(
      'Event flyer updated successfully',
      result,
    );
  }

  // Public Routes
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('events:all')
  @CacheTTL(3600) // Cache for 1 hour
  async findAll(@Query() query: EventPaginationQueryDto) {
    const { items, total, page, pageSize } =
      await this.eventService.findAll(query);
    return ResponseDto.createPaginatedResponse(
      'Events fetched successfully',
      items,
      { total, page, pageSize },
    );
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600) // Cache for 1 hour
  async findOne(@Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    return ResponseDto.createSuccessResponse(
      'Event fetched successfully',
      event,
    );
  }

  // Admin/Community Manager Routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('flyer'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @UploadedFile() file?: MulterFile,
  ) {
    let flyerImageUrl = dto.flyer_image;

    // If a file is uploaded, use the storage service to upload it
    if (file) {
      const uploadResult = await this.eventService.uploadFlyer(file, {
        folder: 'events',
      });
      flyerImageUrl = uploadResult.url;
    }

    const event = await this.eventService.update(id, {
      ...dto,
      flyer_image: flyerImageUrl,
    });
    return ResponseDto.createSuccessResponse(
      'Event updated successfully',
      event,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.eventService.remove(id);
    return ResponseDto.createSuccessResponse(
      'Event deleted successfully',
      result,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Patch(':id/approve')
  async reviewAndApprove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    if (!user?.id) throw new UnauthorizedException();
    const result = await this.eventService.approveEvent(id, user.id);
    return ResponseDto.createSuccessResponse(
      'Event approved successfully',
      result,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Patch(':id/reject')
  async reviewAndReject(@Param('id') id: string) {
    const result = await this.eventService.rejectEvent(id);
    return ResponseDto.createSuccessResponse(
      'Event rejected successfully',
      result,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Patch(':id/feature')
  async markAsFeatured(@Param('id') id: string) {
    const result = await this.eventService.markAsFeatured(id, true);
    return ResponseDto.createSuccessResponse(
      'Event marked as featured',
      result,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager)
  @Patch(':id/unfeature')
  async markAsUnFeatured(@Param('id') id: string) {
    const result = await this.eventService.markAsFeatured(id, false);
    return ResponseDto.createSuccessResponse('Event unfeatured', result);
  }

  // ========== Event-Speaker Association ==========

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Get(':id/speaker')
  async findSpeakersForEvent(@Param('id') eventId: string) {
    const speakers = await this.eventService.findSpeakersForEvent(eventId);
    return ResponseDto.createSuccessResponse(
      'Speakers for event fetched successfully',
      speakers,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Post(':id/speaker')
  async addSpeaker(
    @Param('id') eventId: string,
    @Body('speaker_id') speakerId: string,
  ) {
    const result = await this.eventService.addSpeakerToEvent(
      eventId,
      speakerId,
    );
    return ResponseDto.createSuccessResponse('Speaker added to event', result);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Delete(':id/speaker/:speakerId')
  async removeSpeakerFromEvent(
    @Param('id') eventId: string,
    @Param('speakerId') speakerId: string,
  ) {
    const result = await this.eventService.removeSpeakerFromEvent(
      eventId,
      speakerId,
    );
    return ResponseDto.createSuccessResponse(
      'Speaker removed from event',
      result,
    );
  }

  // ========== Sponsor Management ==========
  // Note: Full sponsor management is available at /event-sponsor/* endpoints
  // These are convenience methods for backward compatibility

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Get(':id/sponsor')
  async findSponsorsForEvent(@Param('id') eventId: string) {
    const sponsors = await this.eventService.findSponsorsForEvent(eventId);
    return ResponseDto.createSuccessResponse(
      'Sponsors for event fetched successfully',
      sponsors,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Post(':id/sponsor')
  async addSponsor(
    @Param('id') eventId: string,
    @Body('sponsor_id') sponsorId: string,
  ) {
    const result = await this.eventService.addSponsorToEvent(
      eventId,
      sponsorId,
    );
    return ResponseDto.createSuccessResponse('Sponsor added to event', result);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin, UserRole.community_manager, UserRole.organizer)
  @Delete(':id/sponsor/:sponsorId')
  async removeSponsor(
    @Param('id') eventId: string,
    @Param('sponsorId') sponsorId: string,
  ) {
    const result = await this.eventService.removeSponsorFromEvent(
      eventId,
      sponsorId,
    );
    return ResponseDto.createSuccessResponse(
      'Sponsor removed from event',
      result,
    );
  }

  // ========== Post-Event Integration ==========
  // Note: Full post-event CRUD is available at /post-event/* endpoints
  // These are convenience methods for quick access from event context

  @Get(':id/highlights')
  async getEventHighlights(@Param('id') eventId: string) {
    // This will be handled by importing PostEventService if needed
    // For now, users should use /post-event/highlight/:eventId
    return ResponseDto.createSuccessResponse(
      'Use /post-event/highlight/' + eventId + ' for event highlights',
      { redirect: `/post-event/highlight/${eventId}` },
    );
  }

  @Get(':id/mentions')
  async getEventMentions(@Param('id') eventId: string) {
    // This will be handled by importing PostEventService if needed
    // For now, users should use /post-event/mention/event/:eventId
    return ResponseDto.createSuccessResponse(
      'Use /post-event/mention/event/' + eventId + ' for social media mentions',
      { redirect: `/post-event/mention/event/${eventId}` },
    );
  }
}
