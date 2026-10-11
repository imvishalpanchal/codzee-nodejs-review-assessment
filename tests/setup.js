process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'z5VsS9BWzQkYXigDXrDJ6tWfd03IQ5diGJbGKkaob78yOuKrrwkMLQ36ua0';
process.env.JWT_EXPIRES_IN = '1h';

const prisma = require('../src/config/database/prismaClient');

beforeAll(async () => {
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
