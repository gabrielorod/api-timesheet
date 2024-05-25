import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  try {
    const administratorGroup = await prisma.group.findFirst({
      where: {
        id: "87137be5-712f-4964-bcdb-c38f0d1751ac",
        name: "administrator",
      },
    });
    const userGroup = await prisma.group.findFirst({
      where: {
        id: "b6fa2f70-0abc-4576-97db-40fe32838431",
        name: "user",
      },
    });

    if (!administratorGroup) {
      await prisma.group.create({
        data: {
          id: "87137be5-712f-4964-bcdb-c38f0d1751ac",
          name: "administrator",
        },
      });
    }

    if (!userGroup) {
      await prisma.group.create({
        data: {
          id: "b6fa2f70-0abc-4576-97db-40fe32838431",
          name: "user",
        },
      });
    }

    console.log("Seed executado com sucesso!");
  } catch (error) {
    console.error("Erro ao executar seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
