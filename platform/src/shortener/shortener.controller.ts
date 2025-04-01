import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Redirect,
  NotFoundException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ShortenerService } from './shortener.service';
import { CreateUrlDto, UpdateUrlDto } from './dto/url.dto/url.dto';
import { Url } from './entities/url.entity/url.entity';
import { Visit } from "./entities/visit.entity/visit.entity";

@Controller()
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Post('urls')
  async create(
      @Body() createUrlDto: CreateUrlDto,
  ): Promise<{ url: Url; shortenedUrl: string }> {
    const { userId, ...urlData } = createUrlDto;
    const url = await this.shortenerService.create(urlData, userId);
    const shortenedUrl = `http://localhost:3000/s/${url.slug}`;
    return {
      url,
      shortenedUrl,
    };
  }

  @Get('urls')
  async findAll(@Query('userId') userId?: string): Promise<Url[]> {
    return this.shortenerService.findAll(userId);
  }

  @Get(':slug')
  @Redirect()
  async redirect(@Param('slug') slug: string) {
    try {
      const url = await this.shortenerService.trackVisit(slug);
      return { url: url.originalUrl, statusCode: HttpStatus.MOVED_PERMANENTLY };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { url: '/404', statusCode: HttpStatus.MOVED_PERMANENTLY };
      }
      throw error;
    }
  }

  @Get('urls/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Url> {
    return this.shortenerService.findBySlug(slug);
  }

  @Put('urls/:id')
  async update(
      @Param('id') id: string,
      @Body() updateUrlDto: UpdateUrlDto,
      @Query('userId') userId?: string,
  ): Promise<Url> {
    return this.shortenerService.updateSlug(id, updateUrlDto, userId);
  }

  @Delete('api/urls/:id')
  async remove(
      @Param('id') id: string,
      @Query('userId') userId?: string,
  ): Promise<void> {
    return this.shortenerService.remove(id, userId);
  }

  @Get('urls/:id/visits')
  async getVisits(@Param('id') id: string): Promise<Visit[]> {
    return this.shortenerService.getVisits(id);
  }
}