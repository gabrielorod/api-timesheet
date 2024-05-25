import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./prisma/prisma.service";
import { CreateUserController } from "./controllers/create-user.controller";
import { envSchema } from "./env";
import { AuthModule } from "./auth/auth.modules";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [CreateUserController],
  providers: [PrismaService],
})
export class AppModule {}
