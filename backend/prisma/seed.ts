/**
 * Idempotent seed. Safe to run on every deploy:
 *  - never overwrites an existing user's password or role
 *  - in production the initial passwords MUST be supplied through the environment
 *
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME
 *   SEED_STOREKEEPER_EMAIL / SEED_STOREKEEPER_PASSWORD   (optional)
 */
import { PrismaClient, Role, UserStatus, ProductStatus, SupplierStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';

function secret(name: string, devFallback: string): string | null {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) return null;
  return devFallback;
}

async function ensureUser(opts: {
  email: string;
  password: string | null;
  fullName: string;
  role: Role;
}) {
  const email = opts.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`   = ${email} already exists (left untouched)`);
    return;
  }
  if (!opts.password) {
    console.log(`   ! skipped ${email}: set its SEED_*_PASSWORD environment variable`);
    return;
  }
  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(opts.password, 12),
      fullName: opts.fullName,
      role: opts.role,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`   + created ${email} [${opts.role}]`);
}

async function main() {
  console.log('Seeding Playhouse Inventory...');

  await prisma.location.upsert({
    where: { name: 'Main Store' },
    update: {},
    create: { name: 'Main Store' },
  });

  await ensureUser({
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@playhouse.co.ke',
    password: secret('SEED_ADMIN_PASSWORD', 'Admin@123'),
    fullName: process.env.SEED_ADMIN_NAME ?? 'Store Manager',
    role: Role.ADMIN,
  });

  await ensureUser({
    email: process.env.SEED_STOREKEEPER_EMAIL ?? 'storekeeper@playhouse.co.ke',
    password: secret('SEED_STOREKEEPER_PASSWORD', 'Storekeeper@123'),
    fullName: 'Store Keeper',
    role: Role.STOREKEEPER,
  });

  const categories = [
    ['Chargers & Cables', 'Chargers, cables and charging accessories'],
    ['Pods', 'Pods and related wireless audio devices'],
    ['Power Banks', 'Portable power banks and charging solutions'],
    ['Smart Watches', 'Smart watches and wearable devices'],
    ['Shavers', 'Electric shavers and grooming devices'],
    ['Earphones & Headphones', 'Earphones, headphones and audio accessories'],
  ] as const;
  for (const [name, description] of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description, status: ProductStatus.ACTIVE },
    });
  }

  for (const name of ['Oraimo', 'Amaya', 'Itel', 'Samsung', 'Havit', 'Recrsi']) {
    await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, status: ProductStatus.ACTIVE },
    });
  }

  for (const supplier of [
    { name: 'Playhouse Electronics Suppliers', contactPerson: 'Main Supplier', email: 'suppliers@playhouse.co.ke' },
    { name: 'Playhouse Accessories Suppliers', contactPerson: 'Accessories Supplier', email: 'accessories@playhouse.co.ke' },
  ]) {
    await prisma.supplier.upsert({
      where: { name: supplier.name },
      update: {},
      create: { ...supplier, address: 'Nairobi, Kenya', status: SupplierStatus.ACTIVE },
    });
  }

  console.log('Seed complete. Change the default passwords after first login.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
