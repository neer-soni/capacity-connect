const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const attempts = await prisma.attempt.findMany({
    include: { assessment: { include: { course: true } }, user: true }
  });
  console.log(JSON.stringify(attempts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());