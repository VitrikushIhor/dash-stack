import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const tasks = await prisma.task.findMany();
  console.log('Total tasks in DB:', tasks.length);
}
test();
