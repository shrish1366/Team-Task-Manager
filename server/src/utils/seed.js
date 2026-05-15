require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin
  const adminPwd = await bcrypt.hash('Admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@demo.com', password: adminPwd, role: 'ADMIN' },
  });

  // Create member
  const memberPwd = await bcrypt.hash('Member123', 12);
  const member = await prisma.user.upsert({
    where: { email: 'member@demo.com' },
    update: {},
    create: { name: 'Jane Member', email: 'member@demo.com', password: memberPwd, role: 'MEMBER' },
  });

  // Create team
  const team = await prisma.team.upsert({
    where: { id: 'seed-team-1' },
    update: {},
    create: {
      id: 'seed-team-1',
      name: 'Engineering',
      description: 'Core engineering team',
      members: { create: [{ userId: admin.id }, { userId: member.id }] },
    },
  });

  // Create project
  const project = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      title: 'ProjectFlow MVP',
      description: 'Build the initial version of ProjectFlow',
      status: 'ACTIVE',
      startDate: new Date(),
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
      teamId: team.id,
      members: { create: [{ userId: admin.id }, { userId: member.id }] },
    },
  });

  // Create tasks
  await prisma.task.createMany({
    skipDuplicates: true,
    data: [
      { title: 'Set up authentication', status: 'COMPLETED', priority: 'HIGH', projectId: project.id, createdById: admin.id, assignedToId: member.id },
      { title: 'Build dashboard UI', status: 'IN_PROGRESS', priority: 'HIGH', projectId: project.id, createdById: admin.id, assignedToId: member.id },
      { title: 'Write API documentation', status: 'TODO', priority: 'MEDIUM', projectId: project.id, createdById: admin.id },
      { title: 'Deploy to Railway', status: 'TODO', priority: 'CRITICAL', projectId: project.id, createdById: admin.id, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('   Admin: admin@demo.com / Admin123');
  console.log('   Member: member@demo.com / Member123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
