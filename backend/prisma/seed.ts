// import { PrismaClient, Role } from '@prisma/client';
// import * as bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Seeding database...');

//   // Create default location
//   console.log('📍 Creating location...');
//   await prisma.location.upsert({
//     where: { name: 'Main Store' },
//     update: {},
//     create: { name: 'Main Store' }
//   });

//   // Create admin user
//   console.log('👤 Creating admin user...');
//   const hashedPassword = await bcrypt.hash('Admin@123', 10);
//   await prisma.user.upsert({
//     where: { email: 'admin@playhouse.co.ke' },
//     update: {},
//     create: {
//       email: 'admin@playhouse.co.ke',
//       passwordHash: hashedPassword,
//       fullName: 'System Administrator',
//       role: Role.ADMIN
//     }
//   });

//   // Create storekeeper user
//   console.log('👤 Creating storekeeper user...');
//   const storekeeperPassword = await bcrypt.hash('Storekeeper@123', 10);
//   await prisma.user.upsert({
//     where: { email: 'storekeeper@playhouse.co.ke' },
//     update: {},
//     create: {
//       email: 'storekeeper@playhouse.co.ke',
//       passwordHash: storekeeperPassword,
//       fullName: 'Storekeeper',
//       role: Role.STOREKEEPER
//     }
//   });

//   // Create categories
//   console.log('📂 Creating categories...');
//   const categories = ['Phones', 'Laptops', 'TVs', 'Accessories', 'Appliances'];
//   for (const name of categories) {
//     await prisma.category.upsert({
//       where: { name },
//       update: {},
//       create: { name }
//     });
//   }

//   // Create brands
//   console.log('🏷️ Creating brands...');
//   const brands = ['Samsung', 'Apple', 'HP', 'Dell', 'Lenovo', 'LG', 'Sony', 'Hisense', 'JBL', 'Oraimo'];
//   for (const name of brands) {
//     await prisma.brand.upsert({
//       where: { name },
//       update: {},
//       create: { name }
//     });
//   }

//   console.log('✅ Seeding complete!');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seeding failed:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });