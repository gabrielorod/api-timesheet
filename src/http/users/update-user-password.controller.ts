import { BadRequestException, Body, Controller, ForbiddenException, Param, Put, UsePipes } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';
import { CurrentUser } from '../../auth/current-user-decorator';

const changeUserPasswordBody = z.object({
  password: z.string().min(8).max(32),
});

type ChangeUserPasswordBody = z.infer<typeof changeUserPasswordBody>;

@Controller('/v1/user')
export class UpdateUserPasswordController {
  constructor(private prisma: PrismaService) {}

  @Put(':id/password')
  @UsePipes(new ZodValidationPipe(changeUserPasswordBody))
  async updateUserPassword(@Body() body: ChangeUserPasswordBody, @Param('id') id: string, @CurrentUser() jwt: { resources: string[] }) {
    if (!jwt.resources.includes('PUT_USER_PASSWORD')) {
      throw new ForbiddenException('Access denied');
    }

    const { password } = body;

    const findUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!findUser) {
      throw new BadRequestException('Invalid fields.');
    }

    const hashedPassword = await this.generateHash(password);

    await this.prisma.user.update({
      where: { id: id },
      data: { password: hashedPassword },
    });
  }

  private async generateHash(password: string): Promise<string> {
    return await hash(password, 8);
  }
}
