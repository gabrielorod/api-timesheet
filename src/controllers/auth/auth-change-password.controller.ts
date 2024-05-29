import { BadRequestException, Body, Controller, Put, UsePipes } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';

const putRecoverPasswordSchema = z.object({
  hash: z.string().uuid(),
  code: z.string().length(5),
  password: z.string().min(8).max(32),
});

type PutRecoverPasswordBody = z.infer<typeof putRecoverPasswordSchema>;

@Controller('/v1/auth')
export class AuthChangePasswordController {
  constructor(private prisma: PrismaService) {}

  @Put('recover-password')
  @UsePipes(new ZodValidationPipe(putRecoverPasswordSchema))
  async resetPassword(@Body() body: PutRecoverPasswordBody) {
    const { hash, code, password } = body;

    const recoverPassword = await this.prisma.recoverPassword.findUnique({
      where: { id: hash },
    });

    if (!recoverPassword) {
      throw new BadRequestException('Invalid fields.');
    }

    if (code !== recoverPassword.code) {
      throw new BadRequestException('Invalid fields.');
    }

    const hashedPassword = await this.generateHash(password);

    await this.prisma.user.update({
      where: { id: recoverPassword.id_user },
      data: { password: hashedPassword },
    });

    await this.prisma.recoverPassword.delete({ where: { id: recoverPassword.id } });
  }

  private async generateHash(password: string): Promise<string> {
    return await hash(password, 8);
  }
}
