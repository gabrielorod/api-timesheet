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

    const resources = [
      { id: '1d8d7a8a-bd68-4ed2-a4c9-5f680c2a9d12', name: 'GET_GROUP' },
      { id: '2d9d7b8b-bd79-4ed3-a5ca-6f791c3b0d23', name: 'POST_HOLIDAY' },
      { id: '3e9d7c8c-bd8a-4ed4-a6cb-7f8a1d4b1d34', name: 'PUT_HOLIDAY' },
      { id: '4f9d7d8d-bd9b-4ed5-a7cc-8f9b1e5c2d45', name: 'GET_HOLIDAYS' },
      { id: '5f9d7e8e-bdac-4ed6-a8cd-90fc1f6d3d56', name: 'POST_TIMESHEET' },
      { id: '6f9d7f8f-bdbd-4ed7-a9ce-a10d1f7d4d67', name: 'GET_TIMESHEET' }, //
      { id: '7f9d8080-bdce-4ed8-aadf-b21e1f8d5d78', name: 'POST_USER' },
      { id: '8f9d8181-bddf-4ed9-abf0-c32f1f9d6d89', name: 'PUT_USER' },
      { id: '9f9d8282-bdf0-4eda-ac01-d43f1f0d7e90', name: 'PUT_USER_PASSWORD' }, //
      { id: 'af9d8383-be01-4edb-ad12-e54f1f1d8f01', name: 'GET_USER' }, //
      { id: 'bf9d8484-be12-4edc-ae23-f65f1f2d9f12', name: 'GET_USERS' },
    ];

    for (const resource of resources) {
      const resourceExists = await prisma.resource.findUnique({
        where: {
          id: resource.id,
        },
      });
      if (!resourceExists) {
        await prisma.resource.create({
          data: resource,
        });
      }
    }

    const resourceGroups = [
      { id: 'c0a8010d-1d60-4dd3-9c34-8e13c24b85a6', id_resource: '1d8d7a8a-bd68-4ed2-a4c9-5f680c2a9d12', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: '908af282-8449-4db1-8928-d5f1001d1e7a', id_resource: '2d9d7b8b-bd79-4ed3-a5ca-6f791c3b0d23', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: 'e2faa3be-13af-4fd6-b703-425ed26f58fa', id_resource: '3e9d7c8c-bd8a-4ed4-a6cb-7f8a1d4b1d34', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: '59155f48-98df-44e0-ad53-be6b658fea61', id_resource: '4f9d7d8d-bd9b-4ed5-a7cc-8f9b1e5c2d45', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: '3f3dbc1c-bb5e-4b67-b3f8-29117b748431', id_resource: '4f9d7d8d-bd9b-4ed5-a7cc-8f9b1e5c2d45', id_group: 'b6fa2f70-0abc-4576-97db-40fe32838431' },
      { id: 'ffb2109c-04ae-4017-bc9d-ad69aa85a482', id_resource: '5f9d7e8e-bdac-4ed6-a8cd-90fc1f6d3d56', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: '1a77e77e-6633-4c34-abf3-6474d9450e6b', id_resource: '5f9d7e8e-bdac-4ed6-a8cd-90fc1f6d3d56', id_group: 'b6fa2f70-0abc-4576-97db-40fe32838431' },
      { id: '748a75fd-c334-4b62-a7b3-97d1bf9afb54', id_resource: '6f9d7f8f-bdbd-4ed7-a9ce-a10d1f7d4d67', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: 'd675386e-8eaf-4e4e-98b9-9c7ec9e65a44', id_resource: '6f9d7f8f-bdbd-4ed7-a9ce-a10d1f7d4d67', id_group: 'b6fa2f70-0abc-4576-97db-40fe32838431' },
      { id: '7d340022-63bc-462e-8a0d-3f8a5434a062', id_resource: '7f9d8080-bdce-4ed8-aadf-b21e1f8d5d78', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: '5f7acb1d-d7ad-440f-8009-a85adc808269', id_resource: '8f9d8181-bddf-4ed9-abf0-c32f1f9d6d89', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: 'bf76dac0-7276-4b7b-a738-16708764452d', id_resource: '9f9d8282-bdf0-4eda-ac01-d43f1f0d7e90', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: 'f1726359-df24-4414-b26c-3a621ec2d20f', id_resource: '9f9d8282-bdf0-4eda-ac01-d43f1f0d7e90', id_group: 'b6fa2f70-0abc-4576-97db-40fe32838431' },
      { id: '9eb94e21-33d2-4f22-a985-1c672f601ee7', id_resource: 'af9d8383-be01-4edb-ad12-e54f1f1d8f01', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
      { id: '74838ab7-d89f-495d-aa15-f86e87034006', id_resource: 'af9d8383-be01-4edb-ad12-e54f1f1d8f01', id_group: 'b6fa2f70-0abc-4576-97db-40fe32838431' },
      { id: 'dc9607c6-3e77-474d-bf01-e597e7af607d', id_resource: 'bf9d8484-be12-4edc-ae23-f65f1f2d9f12', id_group: '87137be5-712f-4964-bcdb-c38f0d1751ac' },
    ];

    for (const resourceGroup of resourceGroups) {
      const resourceGroupExists = await prisma.resourceGroup.findUnique({
        where: {
          id: resourceGroup.id,
        },
      });
      if (!resourceGroupExists) {
        await prisma.resourceGroup.create({
          data: resourceGroup,
        });
      }
    }

    console.log('Seed executado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
