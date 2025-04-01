import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ShortenerController } from './shortener.controller';
import { ShortenerService } from './shortener.service';
import { CreateUrlDto, UpdateUrlDto } from './dto/url.dto/url.dto';
import { Url } from './entities/url.entity/url.entity';

describe('ShortenerController', () => {
  let controller: ShortenerController;
  let service: ShortenerService;

  const mockShortenerService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    trackVisit: jest.fn(),
    updateSlug: jest.fn(),
    remove: jest.fn(),
    getVisits: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        {
          provide: ShortenerService,
          useValue: mockShortenerService,
        },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
    service = module.get<ShortenerService>(ShortenerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a shortened URL', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
        userId: 'user@example.com',
      };

      const createdUrl: Url = {
        id: '1',
        originalUrl: 'https://example.com',
        slug: 'abc123',
        visits: 0,
        userId: 'user@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockShortenerService.create.mockResolvedValue(createdUrl);

      const result = await controller.create(createUrlDto);

      expect(service.create).toHaveBeenCalledWith(
        { originalUrl: 'https://example.com' },
        'user@example.com',
      );
      expect(result).toEqual({
        url: createdUrl,
        shortenedUrl: `http://localhost:3000/s/${createdUrl.slug}`,
      });
    });

    it('should create a shortened URL without userId', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
      };

      const createdUrl: Url = {
        id: '1',
        originalUrl: 'https://example.com',
        slug: 'abc123',
        visits: 0,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockShortenerService.create.mockResolvedValue(createdUrl);

      const result = await controller.create(createUrlDto);

      expect(service.create).toHaveBeenCalledWith(
        { originalUrl: 'https://example.com' },
        undefined,
      );
      expect(result).toEqual({
        url: createdUrl,
        shortenedUrl: `http://localhost:3000/s/${createdUrl.slug}`,
      });
    });
  });

  describe('findAll', () => {
    it('should return all URLs when no userId is provided', async () => {
      const urls: Url[] = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          slug: 'abc123',
          visits: 0,
          userId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          originalUrl: 'https://test.com',
          slug: 'def456',
          visits: 5,
          userId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockShortenerService.findAll.mockResolvedValue(urls);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(urls);
    });

    it('should return user-specific URLs when userId is provided', async () => {
      const userId = 'user@example.com';
      const urls: Url[] = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          slug: 'abc123',
          visits: 0,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockShortenerService.findAll.mockResolvedValue(urls);

      const result = await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(urls);
    });
  });

  describe('redirect', () => {
    it('should redirect to the original URL and track the visit', async () => {
      const slug = 'abc123';
      const url: Url = {
        id: '1',
        originalUrl: 'https://example.com',
        slug,
        visits: 1,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockShortenerService.trackVisit.mockResolvedValue(url);

      const result = await controller.redirect(slug);

      expect(service.trackVisit).toHaveBeenCalledWith(slug);
      expect(result).toEqual({
        url: url.originalUrl,
        statusCode: HttpStatus.MOVED_PERMANENTLY,
      });
    });

    it('should redirect to 404 page when slug is not found', async () => {
      const slug = 'nonexistent';

      mockShortenerService.trackVisit.mockRejectedValue(
        new NotFoundException(),
      );

      const result = await controller.redirect(slug);

      expect(service.trackVisit).toHaveBeenCalledWith(slug);
      expect(result).toEqual({
        url: '/404',
        statusCode: HttpStatus.MOVED_PERMANENTLY,
      });
    });
  });

  describe('findBySlug', () => {
    it('should return URL details for a valid slug', async () => {
      const slug = 'abc123';
      const url: Url = {
        id: '1',
        originalUrl: 'https://example.com',
        slug,
        visits: 0,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockShortenerService.findBySlug.mockResolvedValue(url);
      mockShortenerService.trackVisit.mockResolvedValue(url);

      const result = await controller.findBySlug(slug);

      expect(service.findBySlug).toHaveBeenCalledWith(slug);
      expect(service.trackVisit).toHaveBeenCalledWith(slug);
      expect(result).toEqual(url);
    });

    it('should throw NotFoundException for invalid slug', async () => {
      const slug = 'nonexistent';

      mockShortenerService.findBySlug.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(controller.findBySlug(slug)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update URL slug', async () => {
      const id = '1';
      const updateUrlDto: UpdateUrlDto = { slug: 'newslug' };
      const updatedUrl: Url = {
        id,
        originalUrl: 'https://example.com',
        slug: 'newslug',
        visits: 0,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockShortenerService.updateSlug.mockResolvedValue(updatedUrl);

      const result = await controller.update(id, updateUrlDto);

      expect(service.updateSlug).toHaveBeenCalledWith(
        id,
        updateUrlDto,
        undefined,
      );
      expect(result).toEqual(updatedUrl);
    });

    it('should update URL slug for specific user', async () => {
      const id = '1';
      const userId = 'user@example.com';
      const updateUrlDto: UpdateUrlDto = { slug: 'newslug' };
      const updatedUrl: Url = {
        id,
        originalUrl: 'https://example.com',
        slug: 'newslug',
        visits: 0,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockShortenerService.updateSlug.mockResolvedValue(updatedUrl);

      const result = await controller.update(id, updateUrlDto, userId);

      expect(service.updateSlug).toHaveBeenCalledWith(id, updateUrlDto, userId);
      expect(result).toEqual(updatedUrl);
    });
  });

  describe('remove', () => {
    it('should remove URL', async () => {
      const id = '1';

      mockShortenerService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id, undefined);
    });

    it('should remove URL for specific user', async () => {
      const id = '1';
      const userId = 'user@example.com';

      mockShortenerService.remove.mockResolvedValue(undefined);

      await controller.remove(id, userId);

      expect(service.remove).toHaveBeenCalledWith(id, userId);
    });
  });

  describe('getVisits', () => {
    it('should return list of visits for a given URL id', async () => {
      const urlId = '1';
      const visits = [
        { id: 'v1', visitedAt: new Date(), url: { id: urlId } },
        { id: 'v2', visitedAt: new Date(), url: { id: urlId } },
      ];

      mockShortenerService.getVisits.mockResolvedValue(visits);

      const result = await controller.getVisits(urlId);

      expect(service.getVisits).toHaveBeenCalledWith(urlId);
      expect(result).toEqual(visits.map((v) => ({ visitedAt: v.visitedAt })));
    });
  });
});
