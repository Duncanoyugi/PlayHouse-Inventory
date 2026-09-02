import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(createBrandDto: CreateBrandDto) {
    const existingBrand = await this.prisma.brand.findUnique({
      where: { name: createBrandDto.name },
    });

    if (existingBrand) {
      throw new ConflictException('Brand with this name already exists');
    }

    return this.prisma.brand.create({
      data: {
        name: createBrandDto.name,
        status: createBrandDto.status || 'ACTIVE',
      },
    });
  }

  async findAll(status?: string) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    return this.prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      const existingBrand = await this.prisma.brand.findUnique({
        where: { name: updateBrandDto.name },
      });

      if (existingBrand) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    if (brand._count.products > 0) {
      return this.prisma.brand.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}