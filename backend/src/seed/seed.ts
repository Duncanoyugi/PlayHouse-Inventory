// import { PrismaClient, Role, ProductStatus, SupplierStatus, UserStatus } from '@prisma/client';
// import * as bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting seed...');

//   // Seed Locations
//   console.log('📍 Seeding locations...');
//   await prisma.location.upsert({
//     where: { name: 'Main Store' },
//     update: {},
//     create: { name: 'Main Store' },
//   });

//   // Seed Users
//   console.log('👤 Seeding users...');
//   const adminPassword = await bcrypt.hash('Admin@123', 10);
//   await prisma.user.upsert({
//     where: { email: 'admin@playhouse.co.ke' },
//     update: {},
//     create: {
//       email: 'admin@playhouse.co.ke',
//       passwordHash: adminPassword,
//       fullName: 'System Administrator',
//       role: Role.ADMIN,
//       status: UserStatus.ACTIVE,
//     },
//   });

//   const storekeeperPassword = await bcrypt.hash('Storekeeper@123', 10);
//   await prisma.user.upsert({
//     where: { email: 'storekeeper@playhouse.co.ke' },
//     update: {},
//     create: {
//       email: 'storekeeper@playhouse.co.ke',
//       passwordHash: storekeeperPassword,
//       fullName: 'Storekeeper',
//       role: Role.STOREKEEPER,
//       status: UserStatus.ACTIVE,
//     },
//   });

//   // Seed Categories
//   console.log('📂 Seeding categories...');
//   const categories = [
//     { name: 'Phones', description: 'Mobile phones and smartphones' },
//     { name: 'Laptops', description: 'Laptops and notebooks' },
//     { name: 'TVs', description: 'Televisions and displays' },
//     { name: 'Accessories', description: 'Phone and computer accessories' },
//     { name: 'Appliances', description: 'Home and kitchen appliances' },
//   ];

//   for (const category of categories) {
//     await prisma.category.upsert({
//       where: { name: category.name },
//       update: {},
//       create: {
//         name: category.name,
//         description: category.description,
//         status: ProductStatus.ACTIVE,
//       },
//     });
//   }

//   // Seed Brands
//   console.log('🏷️ Seeding brands...');
//   const brands = [
//     'Samsung', 'Apple', 'HP', 'Dell', 'Lenovo',
//     'LG', 'Sony', 'Hisense', 'JBL', 'Oraimo',
//   ];

//   for (const brand of brands) {
//     await prisma.brand.upsert({
//       where: { name: brand },
//       update: {},
//       create: {
//         name: brand,
//         status: ProductStatus.ACTIVE,
//       },
//     });
//   }

//   // Seed Sample Products (if they don't exist)
//   console.log('📦 Seeding sample products...');
//   const categoryPhones = await prisma.category.findUnique({ where: { name: 'Phones' } });
//   const categoryLaptops = await prisma.category.findUnique({ where: { name: 'Laptops' } });
//   const brandSamsung = await prisma.brand.findUnique({ where: { name: 'Samsung' } });
//   const brandApple = await prisma.brand.findUnique({ where: { name: 'Apple' } });
//   const brandHP = await prisma.brand.findUnique({ where: { name: 'HP' } });

//   if (categoryPhones && brandSamsung) {
//     await prisma.product.upsert({
//       where: { sku: 'SAM-S24-128-BLK' },
//       update: {},
//       create: {
//         sku: 'SAM-S24-128-BLK',
//         name: 'Samsung Galaxy S24 128GB Black',
//         description: 'Samsung Galaxy S24 with 128GB storage in black',
//         costPrice: 85000,
//         reorderLevel: 5,
//         categoryId: categoryPhones.id,
//         brandId: brandSamsung.id,
//         status: ProductStatus.ACTIVE,
//       },
//     });
//   }

//   if (categoryPhones && brandSamsung) {
//     await prisma.product.upsert({
//       where: { sku: 'SAM-S24-256-BLK' },
//       update: {},
//       create: {
//         sku: 'SAM-S24-256-BLK',
//         name: 'Samsung Galaxy S24 256GB Black',
//         description: 'Samsung Galaxy S24 with 256GB storage in black',
//         costPrice: 95000,
//         reorderLevel: 5,
//         categoryId: categoryPhones.id,
//         brandId: brandSamsung.id,
//         status: ProductStatus.ACTIVE,
//       },
//     });
//   }

//   if (categoryPhones && brandApple) {
//     await prisma.product.upsert({
//       where: { sku: 'APP-IP15-128-BLK' },
//       update: {},
//       create: {
//         sku: 'APP-IP15-128-BLK',
//         name: 'Apple iPhone 15 128GB Black',
//         description: 'Apple iPhone 15 with 128GB storage in black',
//         costPrice: 120000,
//         reorderLevel: 5,
//         categoryId: categoryPhones.id,
//         brandId: brandApple.id,
//         status: ProductStatus.ACTIVE,
//       },
//     });
//   }

//   if (categoryLaptops && brandHP) {
//     await prisma.product.upsert({
//       where: { sku: 'HP-PB450-I5' },
//       update: {},
//       create: {
//         sku: 'HP-PB450-I5',
//         name: 'HP ProBook 450 Core i5',
//         description: 'HP ProBook 450 with Intel Core i5 processor',
//         costPrice: 65000,
//         reorderLevel: 3,
//         categoryId: categoryLaptops.id,
//         brandId: brandHP.id,
//         status: ProductStatus.ACTIVE,
//       },
//     });
//   }

//   console.log('✅ Seed completed successfully!');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seed failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });