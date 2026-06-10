/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrismaService = {
  note: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  noteVersion: {
    findMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('NotesService', () => {
  let service: NotesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return notes using findMany when no search is provided', async () => {
      prisma.note.findMany.mockResolvedValue([{ id: '1', title: 'Test' }]);
      const result = await service.findAll('user-1');
      expect(result).toEqual([{ id: '1', title: 'Test' }]);
      expect(prisma.note.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }),
        }),
      );
    });

    it('should return notes using $queryRaw when search is provided', async () => {
      prisma.$queryRaw.mockResolvedValue([
        { id: '1', title: 'Test Search', rank: 1 },
      ]);
      const result = await service.findAll('user-1', 'keyword');
      expect(result).toEqual([{ id: '1', title: 'Test Search', rank: 1 }]);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return note if it belongs to user', async () => {
      prisma.note.findUnique.mockResolvedValue({ id: '1', userId: 'user-1' });
      const result = await service.findOne('1', 'user-1');
      expect(result).toEqual({ id: '1', userId: 'user-1' });
    });

    it('should throw NotFoundException if note does not exist', async () => {
      prisma.note.findUnique.mockResolvedValue(null);
      await expect(service.findOne('1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if note belongs to another user', async () => {
      prisma.note.findUnique.mockResolvedValue({ id: '1', userId: 'user-2' });
      await expect(service.findOne('1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create note with initial version', async () => {
      const dto = { title: 'New Note', content: 'Content', tags: ['a'] };
      prisma.note.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create('user-1', dto);
      expect(result.id).toEqual('1');
      expect(prisma.note.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          title: 'New Note',
          versions: expect.objectContaining({
            create: expect.any(Array),
          }),
        }),
      });
    });
  });
});
