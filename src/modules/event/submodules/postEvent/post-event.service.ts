/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventHighlightDto } from './dto/create-event-highlight.dto';
import { UpdateEventHighlightDto } from './dto/update-event-highlight.dto';
import { CreateSocialMediaMentionDto } from './dto/create-social-media-mention.dto';
import { UpdateSocialMediaMentionDto } from './dto/update-social-media-mention.dto';
import { PostEventPaginationQueryDto } from './dto/post-event-pagination.dto';
import { EventHighlight, SocialMediaMentions } from '@prisma/client';
import { StorageService } from 'src/utils/storage/storage.service';
import { DocumentType } from 'src/utils/storage/constants';
import { MulterFile } from 'src/common/interfaces/multer-file.interface';

@Injectable()
export class PostEventService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  // ==================== EVENT HIGHLIGHTS ====================

  async createEventHighlight(
    dto: CreateEventHighlightDto,
  ): Promise<EventHighlight> {
    // Check event existence
    const event = await this.prisma.event.findUnique({
      where: { id: dto.event_id },
    });
    if (!event) throw new NotFoundException('Event not found');

    const existing = await this.prisma.eventHighlight.findUnique({
      where: { event_id: dto.event_id },
    });
    if (existing)
      throw new ConflictException(
        'Event highlight already exists for this event',
      );

    try {
      return await this.prisma.eventHighlight.create({
        data: {
          event_id: dto.event_id,
          attendance: dto.attendance,
          ticket_sales: dto.ticket_sales,
        },
        include: {
          event: { select: { id: true, title: true, event_date: true } },
        },
      });
    } catch (e) {
      throw new BadRequestException('Failed to create event highlight');
    }
  }

  async findEventHighlight(eventId: string): Promise<EventHighlight> {
    const highlight = await this.prisma.eventHighlight.findUnique({
      where: { event_id: eventId },
      include: {
        event: {
          select: { id: true, title: true, event_date: true, status: true },
        },
      },
    });

    if (!highlight) {
      throw new NotFoundException('Event highlight not found');
    }

    return highlight;
  }

  async findAllEventHighlights(query: PostEventPaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      order = 'DESC',
      event_id,
    } = query;
    const skip = (page - 1) * limit;

    const where = event_id ? { event_id } : {};

    const [highlights, total] = await Promise.all([
      this.prisma.eventHighlight.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order.toLowerCase() },
        include: {
          event: {
            select: { id: true, title: true, event_date: true, status: true },
          },
        },
      }),
      this.prisma.eventHighlight.count({ where }),
    ]);

    return {
      items: highlights,
      total,
      page,
      pageSize: limit,
    };
  }

  async updateEventHighlight(
    eventId: string,
    dto: { attendance?: number; ticket_sales?: number },
  ): Promise<EventHighlight> {
    const existingHighlight = await this.prisma.eventHighlight.findUnique({
      where: { event_id: eventId },
    });

    if (!existingHighlight) {
      throw new NotFoundException('Event highlight not found');
    }

    try {
      const highlight = await this.prisma.eventHighlight.update({
        where: { event_id: eventId },
        data: {
          ...(dto.attendance !== undefined && { attendance: dto.attendance }),
          ...(dto.ticket_sales !== undefined && {
            ticket_sales: dto.ticket_sales,
          }),
        },
        include: {
          event: { select: { id: true, title: true, event_date: true } },
        },
      });

      return highlight;
    } catch (error) {
      throw new BadRequestException('Failed to update event highlight');
    }
  }

  async deleteEventHighlight(eventId: string): Promise<{ message: string }> {
    const existingHighlight = await this.prisma.eventHighlight.findUnique({
      where: { event_id: eventId },
    });

    if (!existingHighlight) {
      throw new NotFoundException('Event highlight not found');
    }

    try {
      await this.prisma.eventHighlight.delete({
        where: { event_id: eventId },
      });
      return { message: 'Event highlight deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete event highlight');
    }
  }

  // ==================== GALLERY ====================

  async addGalleryItems(
    eventId: string,
    items: {
      type: 'image' | 'video';
      url?: string;
      caption?: string;
      featured?: boolean;
      order?: number;
    }[],
    files: MulterFile[] = [],
  ): Promise<any[]> {
    const base = await this.prisma.eventHighlight.findUnique({
      where: { event_id: eventId },
    });
    if (!base) throw new NotFoundException('Event highlight not created yet');

    const prepared: any[] = [];
    let filePtr = 0;
    for (const item of items) {
      let url = item.url;
      if (item.type === 'image' && (!url || url.trim() === '')) {
        const f = files[filePtr++];
        if (!f)
          throw new BadRequestException('Insufficient image files provided');
        const upload = await this.storageService.uploadFileWithMetadata(f, {
          documentType: DocumentType.GENERAL_IMAGE,
          folder: `events/${eventId}/gallery`,
        } as any);
        url = upload.url;
      }
      if (!url) throw new BadRequestException('Gallery item url missing');
      prepared.push({
        event_id: eventId,
        type: item.type,
        url,
        caption: item.caption,
        featured: item.featured ?? false,
        order: item.order,
      });
    }

    const prismaAny = this.prisma as any;
    if (!prismaAny.eventHighlightGallery) {
      throw new BadRequestException(
        'Prisma client not updated for gallery model',
      );
    }
    const created = await this.prisma.$transaction(
      prepared.map((data) => prismaAny.eventHighlightGallery.create({ data })),
    );
    return created;
  }

  async listGallery(eventId: string, featured?: boolean): Promise<any[]> {
    const prismaAny = this.prisma as any;
    if (!prismaAny.eventHighlightGallery) {
      throw new BadRequestException(
        'Prisma client not updated for gallery model',
      );
    }
    return prismaAny.eventHighlightGallery.findMany({
      where: { event_id: eventId, ...(featured !== undefined && { featured }) },
      orderBy: [{ order: 'asc' }, { created_at: 'asc' }],
    });
  }

  async updateGalleryItem(
    id: string,
    dto: {
      caption?: string;
      featured?: boolean;
      order?: number;
      replaceFile?: MulterFile;
    },
  ): Promise<any> {
    const prismaAny = this.prisma as any;
    if (!prismaAny.eventHighlightGallery) {
      throw new BadRequestException(
        'Prisma client not updated for gallery model',
      );
    }
    const existing = await prismaAny.eventHighlightGallery.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Gallery item not found');

    let url = existing.url;
    if (dto.replaceFile && existing.type === 'image') {
      const upload = await this.storageService.uploadFileWithMetadata(
        dto.replaceFile,
        {
          documentType: DocumentType.GENERAL_IMAGE,
          folder: `events/${existing.event_id}/gallery`,
        } as any,
      );
      url = upload.url;
    }

    return prismaAny.eventHighlightGallery.update({
      where: { id },
      data: {
        ...(dto.caption !== undefined && { caption: dto.caption }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
        ...(dto.order !== undefined && { order: dto.order }),
        url,
      },
    });
  }

  async deleteGalleryItem(id: string): Promise<{ message: string }> {
    const prismaAny = this.prisma as any;
    if (!prismaAny.eventHighlightGallery) {
      throw new BadRequestException(
        'Prisma client not updated for gallery model',
      );
    }
    const existing = await prismaAny.eventHighlightGallery.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Gallery item not found');
    await prismaAny.eventHighlightGallery.delete({ where: { id } });
    return { message: 'Gallery item deleted successfully' };
  }

  // ==================== SOCIAL MEDIA MENTIONS ====================

  async createSocialMediaMention(
    dto: CreateSocialMediaMentionDto,
  ): Promise<SocialMediaMentions> {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: dto.event_id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      const mention = await this.prisma.socialMediaMentions.create({
        data: {
          event_id: dto.event_id,
          username: dto.username,
          text: dto.text,
          platform: dto.platform,
          avatar: dto.avatar,
          link: dto.link,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              event_date: true,
            },
          },
        },
      });

      return mention;
    } catch (error) {
      throw new BadRequestException('Failed to create social media mention');
    }
  }

  async findOneSocialMediaMention(id: string): Promise<SocialMediaMentions> {
    const mention = await this.prisma.socialMediaMentions.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            event_date: true,
            status: true,
          },
        },
      },
    });

    if (!mention) {
      throw new NotFoundException('Social media mention not found');
    }

    return mention;
  }

  async findAllSocialMediaMentions(query: PostEventPaginationQueryDto) {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      order = 'DESC',
      event_id,
      platform,
      search,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (event_id) {
      where.event_id = event_id;
    }

    if (platform) {
      where.platform = {
        contains: platform,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { text: { contains: search, mode: 'insensitive' } },
        { platform: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [mentions, total] = await Promise.all([
      this.prisma.socialMediaMentions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order.toLowerCase() },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              event_date: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.socialMediaMentions.count({ where }),
    ]);

    return {
      items: mentions,
      total,
      page,
      pageSize: limit,
    };
  }

  async findSocialMediaMentionsByEvent(
    eventId: string,
    query: PostEventPaginationQueryDto,
  ) {
    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.findAllSocialMediaMentions({
      ...query,
      event_id: eventId,
    });
  }

  async updateSocialMediaMention(
    id: string,
    dto: UpdateSocialMediaMentionDto,
  ): Promise<SocialMediaMentions> {
    const existingMention = await this.prisma.socialMediaMentions.findUnique({
      where: { id },
    });

    if (!existingMention) {
      throw new NotFoundException('Social media mention not found');
    }

    try {
      const mention = await this.prisma.socialMediaMentions.update({
        where: { id },
        data: {
          ...(dto.username && { username: dto.username }),
          ...(dto.text && { text: dto.text }),
          ...(dto.platform && { platform: dto.platform }),
          ...(dto.avatar !== undefined && { avatar: dto.avatar }),
          ...(dto.link && { link: dto.link }),
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              event_date: true,
            },
          },
        },
      });

      return mention;
    } catch (error) {
      throw new BadRequestException('Failed to update social media mention');
    }
  }

  async deleteSocialMediaMention(id: string): Promise<{ message: string }> {
    const existingMention = await this.prisma.socialMediaMentions.findUnique({
      where: { id },
    });

    if (!existingMention) {
      throw new NotFoundException('Social media mention not found');
    }

    try {
      await this.prisma.socialMediaMentions.delete({
        where: { id },
      });
      return { message: 'Social media mention deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete social media mention');
    }
  }
}
