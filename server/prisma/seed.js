const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@worktrack.com' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin@worktrack.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin created:', admin.email);

  // You can optionally add sample workers and attendance here
  // For production, just seeding the admin is usually enough.

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
