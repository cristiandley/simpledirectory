import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortenerService } from './shortener.service';
import { Url } from './entities/url.entity/url.entity';
import { Visit } from './entities/visit.entity/visit.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUrlDto, UpdateUrlDto } from './dto/url.dto/url.dto';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let urlRepository: Repository<Url>;
  let visitRepository: Repository<Visit>;

  const mockUrlRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockVisitRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockUrlRepository,
        },
        {
          provide: getRepositoryToken(Visit),
          useValue: mockVisitRepository,
        },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
    urlRepository = module.get<Repository<Url>>(getRepositoryToken(Url));
    visitRepository = module.get<Repository<Visit>>(getRepositoryToken(Visit));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new URL with generated slug', async () => {
      const createUrlDto: CreateUrlDto = { originalUrl: 'https://example.com' };
      const createdUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        slug: 'abc123',
        visits: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(createdUrl);
      mockUrlRepository.save.mockResolvedValue(createdUrl);

      const result = await service.create(createUrlDto);

      expect(mockUrlRepository.findOne).toHaveBeenCalled();
      expect(mockUrlRepository.create).toHaveBeenCalled();
      expect(mockUrlRepository.save).toHaveBeenCalledWith(createdUrl);
      expect(result).toEqual(createdUrl);
    });

    it('should create a new URL with custom slug', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
        customSlug: 'custom',
      };
      const createdUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        slug: 'custom',
        visits: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(createdUrl);
      mockUrlRepository.save.mockResolvedValue(createdUrl);

      const result = await service.create(createUrlDto);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'custom' },
      });
      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        slug: 'custom',
      });
      expect(mockUrlRepository.save).toHaveBeenCalledWith(createdUrl);
      expect(result).toEqual(createdUrl);
    });

    it('should create a new URL with userId when provided', async () => {
      const userId = 'user@example.com';
      const createUrlDto: CreateUrlDto = { originalUrl: 'https://example.com' };
      const createdUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        slug: 'abc123',
        visits: 0,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUrlRepository.findOne.mockResolvedValue(null);
      mockUrlRepository.create.mockReturnValue(createdUrl);
      mockUrlRepository.save.mockResolvedValue(createdUrl);

      const result = await service.create(createUrlDto, userId);

      expect(mockUrlRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        slug: expect.any(String),
        userId,
      });
      expect(result).toEqual(createdUrl);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
        customSlug: 'existing',
      };

      mockUrlRepository.findOne.mockResolvedValue({
        id: '2',
        slug: 'existing',
      });

      await expect(service.create(createUrlDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all URLs when no userId is provided', async () => {
      const urls = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          slug: 'abc123',
          visits: 0,
        },
        { id: '2', originalUrl: 'https://test.com', slug: 'def456', visits: 2 },
      ];

      mockUrlRepository.find.mockResolvedValue(urls);

      const result = await service.findAll();

      expect(mockUrlRepository.find).toHaveBeenCalled();
      expect(result).toEqual(urls);
    });

    it('should return URLs for a specific user when userId is provided', async () => {
      const userId = 'user@example.com';
      const urls = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          slug: 'abc123',
          visits: 0,
          userId,
        },
      ];

      mockUrlRepository.find.mockResolvedValue(urls);

      const result = await service.findAll(userId);

      expect(mockUrlRepository.find).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toEqual(urls);
    });
  });

  describe('findBySlug', () => {
    it('should return the URL when slug exists', async () => {
      const slug = 'abc123';
      const url = {
        id: '1',
        originalUrl: 'https://example.com',
        slug,
        visits: 0,
      };

      mockUrlRepository.findOne.mockResolvedValue(url);

      const result = await service.findBySlug(slug);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { slug },
      });
      expect(result).toEqual(url);
    });

    it('should throw NotFoundException when slug does not exist', async () => {
      const slug = 'nonexistent';

      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug(slug)).rejects.toThrow(NotFoundException);
    });
  });

  describe('trackVisit', () => {
    it('should increment visit count, log the visit, and return updated URL', async () => {
      const slug = 'abc123';
      const url = {
        id: '1',
        originalUrl: 'https://example.com',
        slug,
        visits: 1,
      };
      const updatedUrl = { ...url, visits: 2 };

      mockUrlRepository.findOne.mockResolvedValue(url);
      mockUrlRepository.save.mockResolvedValue(updatedUrl);
      mockVisitRepository.create.mockReturnValue({ url });
      mockVisitRepository.save.mockResolvedValue({
        id: 'visit-1',
        visitedAt: new Date(),
        url,
      });

      const result = await service.trackVisit(slug);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { slug },
      });
      expect(mockUrlRepository.save).toHaveBeenCalledWith({
        ...url,
        visits: 2,
      });
      expect(mockVisitRepository.create).toHaveBeenCalledWith({ url });
      expect(mockVisitRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedUrl);
    });

    it('should throw NotFoundException when slug does not exist', async () => {
      const slug = 'nonexistent';

      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.trackVisit(slug)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSlug', () => {
    it('should update the slug when URL exists and new slug is available', async () => {
      const id = '1';
      const updateUrlDto: UpdateUrlDto = { slug: 'newslug' };
      const url = {
        id,
        originalUrl: 'https://example.com',
        slug: 'oldslug',
        visits: 0,
      };
      const updatedUrl = { ...url, slug: 'newslug' };

      mockUrlRepository.findOne
        .mockResolvedValueOnce(url)
        .mockResolvedValueOnce(null);
      mockUrlRepository.save.mockResolvedValue(updatedUrl);

      const result = await service.updateSlug(id, updateUrlDto);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'newslug' },
      });
      expect(mockUrlRepository.save).toHaveBeenCalledWith(updatedUrl);
      expect(result).toEqual(updatedUrl);
    });

    it('should throw NotFoundException when URL does not exist', async () => {
      const id = 'nonexistent';
      const updateUrlDto: UpdateUrlDto = { slug: 'newslug' };

      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSlug(id, updateUrlDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when URL does not belong to user', async () => {
      const id = '1';
      const userId = 'user@example.com';
      const updateUrlDto: UpdateUrlDto = { slug: 'newslug' };
      const url = {
        id,
        originalUrl: 'https://example.com',
        slug: 'oldslug',
        visits: 0,
        userId: 'different@example.com',
      };

      mockUrlRepository.findOne.mockResolvedValue(url);

      await expect(
        service.updateSlug(id, updateUrlDto, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new slug is already in use', async () => {
      const id = '1';
      const updateUrlDto: UpdateUrlDto = { slug: 'existingslug' };
      const url = {
        id,
        originalUrl: 'https://example.com',
        slug: 'oldslug',
        visits: 0,
      };
      const existingUrl = { id: '2', slug: 'existingslug' };

      mockUrlRepository.findOne
        .mockResolvedValueOnce(url)
        .mockResolvedValueOnce(existingUrl);

      await expect(service.updateSlug(id, updateUrlDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove URL when it exists', async () => {
      const id = '1';
      const url = {
        id,
        originalUrl: 'https://example.com',
        slug: 'abc123',
        visits: 0,
      };

      mockUrlRepository.findOne.mockResolvedValue(url);
      mockUrlRepository.remove.mockResolvedValue(undefined);

      await service.remove(id);

      expect(mockUrlRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockUrlRepository.remove).toHaveBeenCalledWith(url);
    });

    it('should throw NotFoundException when URL does not exist', async () => {
      const id = 'nonexistent';

      mockUrlRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when URL does not belong to user', async () => {
      const id = '1';
      const userId = 'user@example.com';
      const url = {
        id,
        originalUrl: 'https://example.com',
        slug: 'abc123',
        visits: 0,
        userId: 'different@example.com',
      };

      mockUrlRepository.findOne.mockResolvedValue(url);

      await expect(service.remove(id, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
