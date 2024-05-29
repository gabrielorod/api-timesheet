import { Body, Controller, ForbiddenException, HttpCode, Param, Patch, UsePipes } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { CurrentUser } from '../../auth/current-user-decorator';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';

const patchUserBankHourBody = z.object({
  date: z.string(),
  balance: z.number(),
  description: z.string(),
});

type PatchUserBankHourBody = z.infer<typeof patchUserBankHourBody>;

@Controller('/v1')
export class UserBankController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('user/:id/bank')
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(patchUserBankHourBody))
  async updateUserBank(
    @Param('id') id: string,
    @Body() body: PatchUserBankHourBody,
    @CurrentUser()
    jwt: {
      id: string;
      resources: string[];
    },
  ): Promise<void> {
    if (!jwt.resources.includes('PATCH_USER')) {
      throw new ForbiddenException('Access denied');
    }
    const userBankHour = await this.prisma.bankHour.findUnique({
      where: {
        id_user: id,
      },
    });

    if (!userBankHour) {
      await this.prisma.bankHour.create({
        data: {
          id: uuidv4(),
          id_user: id,
          date: new Date(body.date),
          hour: body.balance,
          description: body.description,
        },
      });
      return;
    }
    await this.prisma.bankHour.update({
      where: {
        id_user: id,
      },
      data: {
        date: new Date(body.date),
        hour: Number(userBankHour.hour) + Number(body.balance),
      },
    });
  }
}
