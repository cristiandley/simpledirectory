import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShortenerService } from './shortener.service';
import { Url } from './entities/url.entity/url.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUrlDto, UpdateUrlDto } from './dto/url.dto/url.dto';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let repository: Repository<Url>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        {
          provide: getRepositoryToken(Url),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
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
        updatedAt: new Date()
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createdUrl);
      mockRepository.save.mockResolvedValue(createdUrl);

      const result = await service.create(createUrlDto);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(createdUrl);
      expect(result).toEqual(createdUrl);
    });

    it('should create a new URL with custom slug', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
        customSlug: 'custom'
      };
      const createdUrl = {
        id: '1',
        originalUrl: 'https://example.com',
        slug: 'custom',
        visits: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createdUrl);
      mockRepository.save.mockResolvedValue(createdUrl);

      const result = await service.create(createUrlDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { slug: 'custom' } });
      expect(mockRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        slug: 'custom'
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdUrl);
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
        updatedAt: new Date()
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(createdUrl);
      mockRepository.save.mockResolvedValue(createdUrl);

      const result = await service.create(createUrlDto, userId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        slug: expect.any(String),
        userId
      });
      expect(result).toEqual(createdUrl);
    });

    it('should throw ConflictException when slug already exists', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'https://example.com',
        customSlug: 'existing'
      };

      mockRepository.findOne.mockResolvedValue({ id: '2', slug: 'existing' });

      await expect(service.create(createUrlDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all URLs when no userId is provided', async () => {
      const urls = [
        { id: '1', originalUrl: 'https://example.com', slug: 'abc123', visits: 0 },
        { id: '2', originalUrl: 'https://test.com', slug: 'def456', visits: 2 }
      ];

      mockRepository.find.mockResolvedValue(urls);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(urls);
    });

    it('should return URLs for a specific user when userId is provided', async () => {
      const userId = 'user@example.com';
      const urls = [
        { id: '1', originalUrl: 'https://example.com', slug: 'abc123', visits: 0, userId }
      ];

      mockRepository.find.mockResolvedValue(urls);

      const result = await service.findAll(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(urls);
    });
  });

  describe('findBySlug', () => {
    it('should return the URL when slug exists', async () => {
      const slug = 'abc123';
      const url = { id: '1', originalUrl: 'https://example.com', slug, visits: 0 };

      mockRepository.findOne.mockResolvedValue(url);

      const result = await service.findBySlug(slug);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { slug } });
      expect(result).toEqual(url);
    });

    it('should throw NotFoundException when slug does not exist', async () => {
      const slug = 'nonexistent';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug(slug)).rejects.toThrow(NotFoundException);
    });
  });

  describe('trackVisit', () => {
    it('should increment visit count and return updated URL', async () => {
      const slug = 'abc123';
      const url = { id: '1', originalUrl: 'https://example.com', slug, visits: 1 };
      const updatedUrl = { ...url, visits: 2 };

      mockRepository.findOne.mockResolvedValue(url);
      mockRepository.save.mockResolvedValue(updatedUrl);

      const result = await service.trackVisit(slug);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { slug } });
      expect(mockRepository.save).toHaveBeenCalledWith({ ...url, visits: 2 });
      expect(result).toEqual(updatedUrl);
    });

    it('should throw NotFoundException when slug does not exist', async () => {
      const slug = 'nonexistent';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.trackVisit(slug)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateSlug', () => {
    it('should update the slug when URL exists and new slug is available', async () => {
      const id = '1';
      const updateUrlDto: UpdateUrlDto = { slug: 'newslug' };
      const url = { id, originalUrl: 'https://example.com', slug: 'oldslug', visits: 0 };
      const updatedUrl = { ...url, slug: 'newslug' };

      mockRepository.findOne
          .mockResolvedValueOnce(url)  // First call returns the URL by ID
          .mockResolvedValueOnce(null); // Second call checks if new slug exists
      mockRepository.save.mockResolvedValue(updatedUrl);

      const result = await service.updateSlug(id, updateUrlDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { slug: 'newslug' } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUrl);
      expect(result).toEqual(updatedUrl);
    });

    it('should throw NotFoundException when URL does not exist', async () => {
      const id = 'nonexistent';
      const updateUrlDto: UpdateUrlDto = { slug: 'newslug' };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSlug(id, updateUrlDto)).rejects.toThrow(NotFoundException);
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
        userId: 'different@example.com'
      };

      mockRepository.findOne.mockResolvedValue(url);

      await expect(service.updateSlug(id, updateUrlDto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new slug is already in use', async () => {
      const id = '1';
      const updateUrlDto: UpdateUrlDto = { slug: 'existingslug' };
      const url = { id, originalUrl: 'https://example.com', slug: 'oldslug', visits: 0 };
      const existingUrl = { id: '2', slug: 'existingslug' };

      mockRepository.findOne
          .mockResolvedValueOnce(url)  // First call returns the URL by ID
          .mockResolvedValueOnce(existingUrl); // Second call finds existing slug

      await expect(service.updateSlug(id, updateUrlDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove URL when it exists', async () => {
      const id = '1';
      const url = { id, originalUrl: 'https://example.com', slug: 'abc123', visits: 0 };

      mockRepository.findOne.mockResolvedValue(url);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockRepository.remove).toHaveBeenCalledWith(url);
    });

    it('should throw NotFoundException when URL does not exist', async () => {
      const id = 'nonexistent';

      mockRepository.findOne.mockResolvedValue(null);

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
        userId: 'different@example.com'
      };

      mockRepository.findOne.mockResolvedValue(url);

      await expect(service.remove(id, userId)).rejects.toThrow(NotFoundException);
    });
  });
});