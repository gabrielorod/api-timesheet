import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  try {
    const administratorGroup = await prisma.group.findFirst({
      where: {
        id: '87137be5-712f-4964-bcdb-c38f0d1751ac',
        name: 'administrator',
      },
    });
    const userGroup = await prisma.group.findFirst({
      where: {
        id: 'b6fa2f70-0abc-4576-97db-40fe32838431',
        name: 'user',
      },
    });

    if (!administratorGroup) {
      await prisma.group.create({
        data: {
          id: '87137be5-712f-4964-bcdb-c38f0d1751ac',
          name: 'administrator',
        },
      });
    }

    if (!userGroup) {
      await prisma.group.create({
        data: {
          id: 'b6fa2f70-0abc-4576-97db-40fe32838431',
          name: 'user',
        },
      });
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@timesheet.com.br',
      },
    });
    if (!adminUser) {
      const hashedPassword = await hash('Admin@123', 8);

      await prisma.user.create({
        data: {
          id: '248b6cfd-bd6c-4cd8-8b2c-15d23d6d8b51',
          id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac',
          name: 'Admin',
          email: 'admin@timesheet.com.br',
          password: hashedPassword,
          team: 'Admin Team',
          hourValue: 0,
          hasBankHours: false,
          contractTotal: 0,
          startDate: new Date(),
        },
      });
    }

    console.log('Seed executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
