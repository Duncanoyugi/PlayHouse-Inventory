import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    const existingLocation = await this.prisma.location.findUnique({
      where: { name: createLocationDto.name },
    });

    if (existingLocation) {
      throw new ConflictException('Location with this name already exists');
    }

    return this.prisma.location.create({
      data: {
        name: createLocationDto.name,
      },
    });
  }

  async findAll() {
    return this.prisma.location.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { inventories: true, goodsReceipts: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        inventories: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        goodsReceipts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { inventories: true, goodsReceipts: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(id: string, updateLocationDto: CreateLocationDto) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (updateLocationDto.name && updateLocationDto.name !== location.name) {
      const existingLocation = await this.prisma.location.findUnique({
        where: { name: updateLocationDto.name },
      });

      if (existingLocation) {
        throw new ConflictException('Location with this name already exists');
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inventories: true, goodsReceipts: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (location._count.inventories > 0 || location._count.goodsReceipts > 0) {
      throw new ConflictException(
        'Cannot delete location with existing inventory or goods receipts',
      );
    }

    return this.prisma.location.delete({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.location.findUnique({
      where: { name },
    });
  }
}