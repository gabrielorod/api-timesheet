import { Module } from '@nestjs/common';
import { IsAliveController } from './controllers/is-alive.controller';
import { ApiManifestController } from './controllers/api-manifest.controller';
import { CreateUserController } from './controllers/create-user.controller';
import { AuthenticateController } from './controllers/authentication.controller';
import { ListUserController } from './controllers/list-user.controller';
import { ListGroupController } from './controllers/list-group.controller';
import { ListHolidayController } from './controllers/list-holiday.controller';
import { CreateHolidayController } from './controllers/create-holiday.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [IsAliveController, ApiManifestController, CreateUserController, AuthenticateController, ListUserController, ListGroupController, ListHolidayController, CreateHolidayController],
  providers: [PrismaService],
})
export class HttpModule {}
