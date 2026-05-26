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

  await prisma.payment.deleteMany({});
  await prisma.salaryRecord.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.advance.deleteMany({});
  await prisma.worker.deleteMany({});

  console.log('Cleared all existing data.');

  // Create Sample Workers
  const w1 = await prisma.worker.create({
    data: {
      workerCode: 'WRK-001',
      fullName: 'John Doe',
      dailyWage: 1000,
      overtimeRate: 1500,
      joiningDate: new Date(),
      role: 'Foreman'
    }
  });

  const w2 = await prisma.worker.create({
    data: {
      workerCode: 'WRK-002',
      fullName: 'Jane Smith',
      dailyWage: 1000,
      overtimeRate: 1500,
      joiningDate: new Date(),
      role: 'Operator'
    }
  });

  console.log('Created clean test workers.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
