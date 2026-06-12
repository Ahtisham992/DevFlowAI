import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({ include: { workspace: true } });
  console.log("Projects:", projects);
}

main().catch(console.error).finally(() => prisma.$disconnect());
