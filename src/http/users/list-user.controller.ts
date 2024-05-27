import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class ListUserController {
  constructor(private prisma: PrismaService) {}

  @Get('user')
  async handle() {
    const users = await this.prisma.user.findMany({
      orderBy: {
        team: 'desc',
      },
    });

    const userList: any[] = [];

    for (const user of users) {
      const group = await this.prisma.group.findUnique({
        where: {
          id: user.id_group,
        },
        select: {
          id: true,
          name: true,
        },
      });

      const bankHours = await this.prisma.bankHour.findMany({
        where: {
          id_user: user.id,
        },
      });

      const totalBankHours = bankHours.reduce((acc, current) => acc + 1, 0); // Lugar do 1 adicionar current.hour

      userList.push({
        id: user.id,
        name: user.name,
        email: user.email,
        team: user.team,
        hourValue: user.hourValue,
        hasBankHours: user.hasBankHours,
        totalBankHours: totalBankHours,
        contractTotal: user.contractTotal,
        groupId: user.id_group,
        groupName: group?.name,
      });
    }

    return userList;
  }
}
