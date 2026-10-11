process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test_codzee_jwt_secret_key_2026';
process.env.JWT_EXPIRES_IN = '1h';

const prisma = require('../src/config/database/prismaClient');

beforeAll(async () => {
  // Ensure tables are clean before running tests
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
