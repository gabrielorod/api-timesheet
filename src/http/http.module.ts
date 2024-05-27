import { Module } from '@nestjs/common';
import { IsAliveController } from './api/is-alive.controller';
import { ApiManifestController } from './api/api-manifest.controller';
import { CreateUserController } from './users/create-user.controller';
import { AuthenticateController } from './auth/authentication.controller';
import { ListUserController } from './users/list-user.controller';
import { ListGroupController } from './group/list-group.controller';
import { ListHolidayController } from './holiday/list-holiday.controller';
import { CreateHolidayController } from './holiday/create-holiday.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IsAliveController, ApiManifestController, CreateUserController, AuthenticateController, ListUserController, ListGroupController, ListHolidayController, CreateHolidayController],
  providers: [PrismaService],
})
export class HttpModule {}
