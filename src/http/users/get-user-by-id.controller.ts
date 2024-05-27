import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('/v1/user')
export class GetUserByIdController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  async userById(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new BadRequestException('Invalid field.');
    }

    const group = await this.prisma.group.findUnique({
      where: {
        id: user.id_group,
      },
    });

    const bankHours = await this.prisma.bankHour.findMany({
      where: {
        id_user: user.id,
      },
    });

    const totalBankHours = bankHours.reduce((acc, current) => acc + 1, 0); // Lugar do 1 adicionar current.hour

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      team: user.team,
      hourValue: user.hourValue,
      hasBankHours: user.hasBankHours,
      totalBankHours: totalBankHours,
      contractTotal: user.contractTotal,
      groupId: group?.id,
      groupName: group?.name,
      startDate: user.startDate,
    };
  }
}
