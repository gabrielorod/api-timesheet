import { Body, Controller, HttpCode, Post, UnauthorizedException, UsePipes } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const postRecoverPasswordSchema = z.object({
  email: z.string(),
});

type PostRecoverPasswordBody = z.infer<typeof postRecoverPasswordSchema>;

@Controller('/v1/auth')
export class AuthRecoverPasswordController {
  constructor(private prisma: PrismaService) {}

  @Post('recover-password')
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(postRecoverPasswordSchema))
  async initiatePasswordReset(@Body() body: PostRecoverPasswordBody) {
    const { email } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid field.');
    }

    const code = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

    await this.prisma.recoverPassword.create({
      data: {
        id: uuidv4(),
        id_user: user.id,
        code: String(code),
      },
    });
  }
}
