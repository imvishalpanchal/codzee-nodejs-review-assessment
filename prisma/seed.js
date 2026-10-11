const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Vishal Panchal (Admin)',
      email: 'admin@codzee-review.dev',
      password: adminPassword,
      role: 'admin'
    }
  });

  // Create demo member user
  const memberPassword = await bcrypt.hash('Member@123456', 10);
  const member = await prisma.user.create({
    data: {
      name: 'Developer Member',
      email: 'member@codzee-review.dev',
      password: memberPassword,
      role: 'member'
    }
  });

  // Create demo project
  const project1 = await prisma.project.create({
    data: {
      name: 'Codzee AI Integration Pipeline',
      description: 'End-to-end automated code review and quality validation pipeline.',
      status: 'in_progress',
      ownerId: admin.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Developer Portal Revamp',
      description: 'Frontend overhaul for candidate developer portal.',
      status: 'planning',
      ownerId: member.id
    }
  });

  // Create demo tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Configure GitHub Webhooks',
        description: 'Set up push and pull_request event listeners for Codzee app.',
        priority: 'high',
        status: 'in_progress',
        projectId: project1.id,
        assigneeId: member.id
      },
      {
        title: 'Benchmark Review Quality',
        description: 'Test static analysis and edge case detection on sample PRs.',
        priority: 'urgent',
        status: 'todo',
        projectId: project1.id,
        assigneeId: admin.id
      },
      {
        title: 'Draft UX Architecture Wireframes',
        description: 'Create responsive mockups for feedback submission.',
        priority: 'medium',
        status: 'todo',
        projectId: project2.id,
        assigneeId: member.id
      }
    ]
  });

  console.log('Database seeded successfully!');
  console.log(`Admin user: admin@codzee-review.dev (password: Admin@123456)`);
  console.log(`Member user: member@codzee-review.dev (password: Member@123456)`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
