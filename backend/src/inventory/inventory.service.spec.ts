import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MovementType, AdjustmentType } from '@prisma/client';
import { vi } from 'vitest';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: vi.fn((callback) => callback(mockPrismaService)),
    product: {
      findUnique: vi.fn(),
    },
    location: {
      findUnique: vi.fn(),
    },
    inventoryBalance: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    stockMovement: {
      create: vi.fn(),
    },
    stockAdjustment: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    mockPrismaService.$transaction.mockImplementation((callback) =>
      callback(mockPrismaService),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('stockIn', () => {
    const stockInDto = {
      productId: 'product-123',
      locationId: 'location-123',
      quantity: 10,
      reason: 'Test stock in',
      reference: 'REF-001',
    };

    const mockProduct = {
      id: 'product-123',
      name: 'Test Product',
      sku: 'TEST-001',
    };

    const mockLocation = {
      id: 'location-123',
      name: 'Test Location',
    };

    const mockInventory = {
      id: 'inventory-123',
      productId: 'product-123',
      locationId: 'location-123',
      quantity: 50,
      reservedQuantity: 0,
    };

    it('should successfully add stock', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventoryBalance.update.mockResolvedValue({
        ...mockInventory,
        quantity: 60,
      });
      mockPrismaService.stockMovement.create.mockResolvedValue({
        id: 'movement-123',
        inventoryId: 'inventory-123',
        productId: 'product-123',
        type: MovementType.STOCK_IN,
        quantity: 10,
        previousQuantity: 50,
        newQuantity: 60,
        reason: 'Test stock in',
        reference: 'REF-001',
      });

      const result = await service.stockIn(stockInDto, 'user-123');

      expect(result).toHaveProperty('inventory');
      expect(result).toHaveProperty('movement');
      expect(result.inventory.quantity).toBe(60);
      expect(result.movement.quantity).toBe(10);
      expect(result.movement.type).toBe(MovementType.STOCK_IN);
    });

    it('should create new inventory if none exists', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(null);
      mockPrismaService.inventoryBalance.create.mockResolvedValue({
        id: 'inventory-new',
        productId: 'product-123',
        locationId: 'location-123',
        quantity: 10,
        reservedQuantity: 0,
      });

      const result = await service.stockIn(stockInDto, 'user-123');

      expect(mockPrismaService.inventoryBalance.create).toHaveBeenCalled();
      expect(result.inventory.quantity).toBe(10);
    });

    it('should throw NotFoundException for invalid product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.stockIn(stockInDto, 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid quantity', async () => {
      const invalidDto = { ...stockInDto, quantity: 0 };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);

      await expect(service.stockIn(invalidDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('stockOut', () => {
    const stockOutDto = {
      productId: 'product-123',
      locationId: 'location-123',
      quantity: 5,
      reason: 'Test stock out',
      reference: 'REF-002',
    };

    const mockProduct = {
      id: 'product-123',
      name: 'Test Product',
    };

    const mockLocation = {
      id: 'location-123',
      name: 'Test Location',
    };

    const mockInventory = {
      id: 'inventory-123',
      productId: 'product-123',
      locationId: 'location-123',
      quantity: 50,
      reservedQuantity: 10,
    };

    it('should successfully remove stock', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventoryBalance.update.mockResolvedValue({
        ...mockInventory,
        quantity: 45,
      });
      mockPrismaService.stockMovement.create.mockResolvedValue({
        type: MovementType.STOCK_OUT,
        quantity: 5,
      });

      const result = await service.stockOut(stockOutDto, 'user-123');

      expect(result.inventory.quantity).toBe(45);
      expect(result.movement.type).toBe(MovementType.STOCK_OUT);
    });

    it('should throw BadRequestException for insufficient stock', async () => {
      const insufficientDto = { ...stockOutDto, quantity: 50 };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(mockInventory);

      await expect(service.stockOut(insufficientDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-existent inventory', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(null);

      await expect(service.stockOut(stockOutDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('adjust', () => {
    const adjustDto = {
      productId: 'product-123',
      locationId: 'location-123',
      quantity: 5,
      type: AdjustmentType.INCREASE,
      reason: 'Test adjustment',
    };

    const mockProduct = {
      id: 'product-123',
      name: 'Test Product',
    };

    const mockLocation = {
      id: 'location-123',
      name: 'Test Location',
    };

    const mockInventory = {
      id: 'inventory-123',
      productId: 'product-123',
      locationId: 'location-123',
      quantity: 50,
      reservedQuantity: 0,
    };

    it('should successfully increase stock', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventoryBalance.update.mockResolvedValue({
        ...mockInventory,
        quantity: 55,
      });
      mockPrismaService.stockMovement.create.mockResolvedValue({
        type: MovementType.ADJUSTMENT,
        quantity: 5,
      });

      const result = await service.adjust(adjustDto, 'user-123');

      expect(result.inventory.quantity).toBe(55);
      expect(result.movement.type).toBe(MovementType.ADJUSTMENT);
      expect(result.adjustmentNumber).toBeDefined();
    });

    it('should successfully decrease stock', async () => {
      const decreaseDto = { ...adjustDto, type: AdjustmentType.DECREASE };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(mockInventory);
      mockPrismaService.inventoryBalance.update.mockResolvedValue({
        ...mockInventory,
        quantity: 45,
      });

      const result = await service.adjust(decreaseDto, 'user-123');

      expect(result.inventory.quantity).toBe(45);
    });

    it('should throw BadRequestException for decrease below zero', async () => {
      const decreaseDto = { ...adjustDto, type: AdjustmentType.DECREASE, quantity: 60 };
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.location.findUnique.mockResolvedValue(mockLocation);
      mockPrismaService.inventoryBalance.findUnique.mockResolvedValue(mockInventory);

      await expect(service.adjust(decreaseDto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});