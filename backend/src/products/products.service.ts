import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Check if SKU already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this SKU already exists');
    }

    // Check if barcode already exists (if provided)
    if (createProductDto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: createProductDto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if brand exists
    const brand = await this.prisma.brand.findUnique({
      where: { id: createProductDto.brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    // Create product
    return this.prisma.product.create({
      data: {
        sku: createProductDto.sku,
        name: createProductDto.name,
        description: createProductDto.description,
        barcode: createProductDto.barcode,
        costPrice: createProductDto.costPrice,
        reorderLevel: createProductDto.reorderLevel,
        categoryId: createProductDto.categoryId,
        brandId: createProductDto.brandId,
        status: createProductDto.status || 'ACTIVE',
      },
      include: {
        category: true,
        brand: true,
      },
    });
  }

  async findAll(filters: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, categoryId, brandId, status, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          brand: true,
          inventories: {
            select: {
              quantity: true,
              reservedQuantity: true,
              location: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate available quantity for each product
    const productsWithStock = products.map((product) => {
      const totalQuantity = product.inventories.reduce(
        (sum, inv) => sum + inv.quantity,
        0,
      );
      const totalReserved = product.inventories.reduce(
        (sum, inv) => sum + inv.reservedQuantity,
        0,
      );
      const availableQuantity = totalQuantity - totalReserved;

      return {
        ...product,
        totalQuantity,
        reservedQuantity: totalReserved,
        availableQuantity,
      };
    });

    return {
      items: productsWithStock,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        inventories: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const totalQuantity = product.inventories.reduce(
      (sum, inv) => sum + inv.quantity,
      0,
    );
    const totalReserved = product.inventories.reduce(
      (sum, inv) => sum + inv.reservedQuantity,
      0,
    );
    const availableQuantity = totalQuantity - totalReserved;

    return {
      ...product,
      totalQuantity,
      reservedQuantity: totalReserved,
      availableQuantity,
    };
  }

  async findBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        brand: true,
        inventories: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const totalQuantity = product.inventories.reduce(
      (sum, inv) => sum + inv.quantity,
      0,
    );
    const totalReserved = product.inventories.reduce(
      (sum, inv) => sum + inv.reservedQuantity,
      0,
    );
    const availableQuantity = totalQuantity - totalReserved;

    return {
      ...product,
      totalQuantity,
      reservedQuantity: totalReserved,
      availableQuantity,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if new SKU is already taken
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { sku: updateProductDto.sku },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Check if new barcode is already taken
    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: updateProductDto.barcode },
      });

      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    // Check if category exists (if updating)
    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Check if brand exists (if updating)
    if (updateProductDto.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: updateProductDto.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }
    }

    // Remove undefined values
    const updateData: any = { ...updateProductDto };
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
      },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventories: true,
        purchaseOrderItems: true,
        goodsReceiptItems: true,
        movements: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If product has transactions, soft delete
    if (
      product.inventories.length > 0 ||
      product.purchaseOrderItems.length > 0 ||
      product.goodsReceiptItems.length > 0 ||
      product.movements.length > 0
    ) {
      return this.prisma.product.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
    }

    // If no transactions, delete permanently
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: {
        id: { in: ids },
        status: 'ACTIVE',
      },
      include: {
        category: true,
        brand: true,
        inventories: {
          include: {
            location: true,
          },
        },
      },
    });
  }
}