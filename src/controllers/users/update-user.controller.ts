import { BadRequestException, Body, Controller, ForbiddenException, Param, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { z } from 'zod';
import { CurrentUser } from '../../auth/current-user-decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

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
@UseGuards(JwtAuthGuard)
export class UpdateUserPasswordController {
  constructor(private prisma: PrismaService) {}

  @Put(':id')
  // @UsePipes(new ZodValidationPipe(changeUserPasswordBody))
  async updateUserPassword(@Body() body: ChangeUserPasswordBody, @Param('id') id: string, @CurrentUser() jwt: { resources: string[] }) {
    if (!jwt.resources.includes('PUT_USER')) {
      throw new ForbiddenException('Access denied');
    }

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
