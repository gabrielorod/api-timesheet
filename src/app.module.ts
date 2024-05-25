import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './database/prisma/prisma.service';
import { CreateUserController } from './http/controllers/create-user.controller';
import { envSchema } from './env/env';
import { AuthModule } from './auth/auth.modules';
import { AuthenticateController } from './http/controllers/authentication.controller';
import { IsAliveController } from './http/controllers/is-alive.controller';
import { ApiManifestController } from './http/controllers/api-manifest.controller';
import { ListUserController } from './http/controllers/list-user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [IsAliveController, ApiManifestController, CreateUserController, AuthenticateController, ListUserController],
  providers: [PrismaService],
})
export class AppModule {}
