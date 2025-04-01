import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from './entities/url.entity/url.entity';
import { CreateUrlDto, UpdateUrlDto } from './dto/url.dto/url.dto';
import { Visit } from './entities/visit.entity/visit.entity';

@Injectable()
export class ShortenerService {
  private readonly logger = new Logger(ShortenerService.name);

  constructor(
    @InjectRepository(Url)
    private urlRepository: Repository<Url>,
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
  ) {}

  private generateSlug(length: number = 6): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async create(createUrlDto: CreateUrlDto, userId?: string): Promise<Url> {
    const { originalUrl, customSlug } = createUrlDto;
    const slug = customSlug || this.generateSlug();
    const existingUrl = await this.urlRepository.findOne({ where: { slug } });
    if (existingUrl) {
      throw new ConflictException('This slug is already in use');
    }
    const url = this.urlRepository.create({
      originalUrl,
      slug,
      userId,
    });
    return this.urlRepository.save(url);
  }

  async findAll(userId?: string): Promise<Url[]> {
    if (userId) {
      return this.urlRepository.find({ where: { userId } });
    }
    return this.urlRepository.find();
  }

  async findBySlug(slug: string): Promise<Url> {
    const url = await this.urlRepository.findOne({ where: { slug } });
    if (!url) {
      throw new NotFoundException(`URL with slug ${slug} not found`);
    }
    return url;
  }

  async trackVisit(slug: string): Promise<Url> {
    const url = await this.urlRepository.findOne({
      where: { slug },
    });
    if (!url) {
      this.logger.error('No url found');
      throw new NotFoundException('URL not found');
    }
    url.visits += 1;
    await this.urlRepository.save(url);
    const visit = this.visitRepository.create({ url: { id: url.id } });
    await this.visitRepository.save(visit);
    return url;
  }

  async updateSlug(
    id: string,
    updateUrlDto: UpdateUrlDto,
    userId?: string,
  ): Promise<Url> {
    const url = await this.urlRepository.findOne({ where: { id } });
    if (!url) throw new NotFoundException(`URL with ID ${id} not found`);
    if (userId && url.userId !== userId)
      throw new NotFoundException(`URL with ID ${id} not found for this user`);
    const existingUrl = await this.urlRepository.findOne({
      where: { slug: updateUrlDto.slug },
    });
    if (existingUrl && existingUrl.id !== id)
      throw new ConflictException('This slug is already in use');
    url.slug = updateUrlDto.slug;
    return this.urlRepository.save(url);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const url = await this.urlRepository.findOne({ where: { id } });
    if (!url) throw new NotFoundException(`URL with ID ${id} not found`);
    if (userId && url.userId !== userId) {
      throw new NotFoundException(`URL with ID ${id} not found for this user`);
    }
    await this.urlRepository.remove(url);
  }

  async getVisits(id: string): Promise<Visit[]> {
    const url = await this.urlRepository.findOneOrFail({ where: { id } });
    return this.visitRepository.find({
      where: { url: { id: url.id } },
      order: { visitedAt: 'ASC' },
    });
  }
}
