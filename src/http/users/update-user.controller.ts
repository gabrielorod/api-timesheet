import { BadRequestException, Body, Controller, Param, Put, UsePipes } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';

const changeUserPasswordBody = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  team: z.string().optional(),
  hourValue: z.number().optional(),
  hasBankHours: z.boolean().optional(),
  contractTotal: z.number().optional(),
  groupId: z.string().uuid().optional(),
  startDate: z.string().optional(),
});

type ChangeUserPasswordBody = z.infer<typeof changeUserPasswordBody>;

@Controller('/v1/user')
export class UpdateUserPasswordController {
  constructor(private prisma: PrismaService) {}

  @Put(':id')
  @UsePipes(new ZodValidationPipe(changeUserPasswordBody))
  async updateUserPassword(@Body() body: ChangeUserPasswordBody, @Param('id') id: string) {
    const { name, email, team, hourValue, hasBankHours, contractTotal, groupId, startDate } = body;

    const findUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!findUser) {
      throw new BadRequestException('Invalid fields.');
    }

    await this.prisma.user.update({
      where: { id: id },
      data: {
        name,
        email,
        team,
        hourValue,
        hasBankHours,
        contractTotal,
        id_group: groupId,
        startDate,
      },
    });
  }
}
