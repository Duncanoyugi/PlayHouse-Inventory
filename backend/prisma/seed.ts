import {
  PrismaClient,
  Role,
  UserStatus,
  ProductStatus,
  SupplierStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Playhouse Inventory database...\n');

  // ============================================================
  // 1. LOCATION
  // ============================================================

  console.log('📍 Creating location...');

  const mainStore = await prisma.location.upsert({
    where: {
      name: 'Main Store',
    },
    update: {},
    create: {
      name: 'Main Store',
    },
  });

  console.log('   ✓ Main Store');

  // ============================================================
  // 2. USERS
  // ============================================================

  console.log('\n👤 Creating users...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@playhouse.co.ke',
    },
    update: {
      passwordHash: adminPassword,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'admin@playhouse.co.ke',
      passwordHash: adminPassword,
      fullName: 'System Administrator',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`   ✓ ${admin.email} [ADMIN]`);

  const storekeeperPassword = await bcrypt.hash(
    'Storekeeper@123',
    10,
  );

  const storekeeper = await prisma.user.upsert({
    where: {
      email: 'storekeeper@playhouse.co.ke',
    },
    update: {
      passwordHash: storekeeperPassword,
      fullName: 'Storekeeper',
      role: Role.STOREKEEPER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'storekeeper@playhouse.co.ke',
      passwordHash: storekeeperPassword,
      fullName: 'Storekeeper',
      role: Role.STOREKEEPER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log(`   ✓ ${storekeeper.email} [STOREKEEPER]`);

  // ============================================================
  // 3. CATEGORIES
  // ============================================================

  console.log('\n📂 Creating categories...');

  const categories = [
    {
      name: 'Chargers & Cables',
      description: 'Chargers, cables and charging accessories',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Pods',
      description: 'Pods and related wireless audio devices',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Power Banks',
      description: 'Portable power banks and charging solutions',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Smart Watches',
      description: 'Smart watches and wearable devices',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Shavers',
      description: 'Electric shavers and grooming devices',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Earphones & Headphones',
      description: 'Earphones, headphones and audio accessories',
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Audio',
      description: 'Audio products',
      status: ProductStatus.INACTIVE,
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: {
        name: category.name,
      },
      update: {
        description: category.description,
        status: category.status,
      },
      create: category,
    });

    categoryMap.set(created.name, created.id);

    console.log(`   ✓ ${created.name}`);
  }

  // ============================================================
  // 4. BRANDS
  // ============================================================

  console.log('\n🏷️ Creating brands...');

  const brands = [
    'Oraimo',
    'Amaya',
    'Itel',
    'Samsung',
    'Havit',
    'Recrsi',
  ];

  const brandMap = new Map<string, string>();

  for (const name of brands) {
    const brand = await prisma.brand.upsert({
      where: {
        name,
      },
      update: {
        status: ProductStatus.ACTIVE,
      },
      create: {
        name,
        status: ProductStatus.ACTIVE,
      },
    });

    brandMap.set(brand.name, brand.id);

    console.log(`   ✓ ${brand.name}`);
  }

  // ============================================================
  // 5. CHILD CATEGORIES
  // ============================================================
  //
  // NOTE:
  // Your current Prisma Category model does NOT have:
  //   parentId
  //   slug
  //
  // Therefore these child categories cannot currently be
  // represented as a hierarchy.
  //
  // They are intentionally NOT inserted into the database here.
  //
  // If you want the exact source catalog hierarchy, your Prisma
  // schema needs to be extended with parentId/self-relation.
  //
  // ============================================================

  // ============================================================
  // 6. SUPPLIERS
  // ============================================================

  console.log('\n🚚 Creating suppliers...');

  const suppliers = [
    {
      name: 'Playhouse Electronics Suppliers',
      contactPerson: 'Main Supplier',
      email: 'suppliers@playhouse.co.ke',
      phone: '+254700000001',
      address: 'Nairobi, Kenya',
      status: SupplierStatus.ACTIVE,
    },
    {
      name: 'Playhouse Accessories Suppliers',
      contactPerson: 'Accessories Supplier',
      email: 'accessories@playhouse.co.ke',
      phone: '+254700000002',
      address: 'Nairobi, Kenya',
      status: SupplierStatus.ACTIVE,
    },
  ];

  for (const supplier of suppliers) {
    const created = await prisma.supplier.upsert({
      where: {
        name: supplier.name,
      },
      update: {
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        status: supplier.status,
      },
      create: supplier,
    });

    console.log(`   ✓ ${created.name}`);
  }

  // ============================================================
  // 7. PRODUCTS
  // ============================================================
  //
  // We intentionally do NOT seed arbitrary products here.
  //
  // Your supplied source only gives us categories and brands,
  // not actual product SKUs, prices, barcodes or reorder levels.
  //
  // Products should be created through the Products module/API
  // once real Playhouse product data is available.
  //
  // ============================================================

  // ============================================================
  // SUMMARY
  // ============================================================

  console.log('\n============================================');
  console.log('🎉 PLAYHOUSE SEED COMPLETED');
  console.log('============================================');

  console.log('\n📍 Location');
  console.log(`   ${mainStore.name}`);

  console.log('\n👤 Users');
  console.log('   ADMIN');
  console.log('   Email:    admin@playhouse.co.ke');
  console.log('   Password: Admin@123');

  console.log('\n   STOREKEEPER');
  console.log('   Email:    storekeeper@playhouse.co.ke');
  console.log('   Password: Storekeeper@123');

  console.log('\n📂 Categories');
  console.log(`   ${categories.length} categories created`);

  console.log('\n🏷️ Brands');
  console.log(`   ${brands.length} brands created`);

  console.log('\n🚚 Suppliers');
  console.log(`   ${suppliers.length} suppliers created`);

  console.log('\n📦 Products');
  console.log('   No products seeded');

  console.log('\n============================================');
}

main()
  .catch((error) => {
    console.error('\n❌ Seeding failed:');
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });