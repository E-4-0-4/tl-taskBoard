import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, Status } from '../app/generated/prisma/client';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1 Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Taskboard Admin',
      email: 'admin@taskboard.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // 2 Members
  const member1 = await prisma.user.create({
    data: {
      name: 'sagar ghimire',
      email: 'sagar@taskboard.com',
      password: hashedPassword,
      role: Role.MEMBER,
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'abc def',
      email: 'abc@taskboard.com',
      password: hashedPassword,
      role: Role.MEMBER,
    },
  });

  // Initial Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup  Pipeline',
        description: 'Configure for Taskboard deployment',
        status: Status.TODO,
        userId: admin.id,
      },
      {
        title: 'Design Taskboard UI',
        description: 'Build columns for To Do, In Progress, Done',
        status: Status.IN_PROCESS,
        userId: member1.id,
      },
      {
        title: 'Fix Authentication Bug',
        description: 'Ensure JWT cookies persist properly across route changes',
        status: Status.DONE,
        userId: member2.id,
      },
    ],
  });

  console.log('Taskboard database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });