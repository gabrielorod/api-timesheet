import { Module } from '@nestjs/common';
import { IsAliveController } from './api/is-alive.controller';
import { ApiManifestController } from './api/api-manifest.controller';
import { CreateUserController } from './users/create-user.controller';
import { AuthTokenController } from './auth/auth-token.controller';
import { ListUserController } from './users/list-user.controller';
import { ListGroupController } from './group/list-group.controller';
import { ListHolidayController } from './holiday/list-holiday.controller';
import { CreateHolidayController } from './holiday/create-holiday.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthRefreshTokenController } from './auth/auth-refresh-token.controller';
import { AuthRecoverPasswordController } from './auth/auth-recover-password.controller';
import { AuthChangePasswordController } from './auth/auth-change-password.controller';
import { UpdateUserPasswordController } from './users/update-user-password.controller';
import { GetUserByIdController } from './users/get-user-by-id.controller';
import { CreateTimesheetController } from './timesheet/create-timesheet.controller';
import { UserBankController } from './users/user-bank.controller';
import { ListTimesheetController } from './timesheet/list-timesheet.controller';

@Module({
  controllers: [IsAliveController, ApiManifestController, AuthTokenController, AuthRefreshTokenController, AuthRecoverPasswordController, AuthChangePasswordController, CreateUserController, ListUserController, GetUserByIdController, UpdateUserPasswordController, UserBankController, ListGroupController, ListHolidayController, CreateHolidayController, CreateTimesheetController, ListTimesheetController],
  providers: [PrismaService],
})
export class HttpModule {}
