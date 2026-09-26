const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const attempts = await prisma.attempt.findMany({
    include: { assessment: true }
  });

  for (const attempt of attempts) {
    const percentage = Math.round((attempt.score / attempt.total) * 100);
    if (percentage >= 60) {
      const existingCert = await prisma.certificate.findFirst({
        where: { userId: attempt.userId, courseId: attempt.assessment.courseId }
      });
      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            userId: attempt.userId,
            courseId: attempt.assessment.courseId
          }
        });
        console.log(`Created certificate for user ${attempt.userId} course ${attempt.assessment.courseId}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());