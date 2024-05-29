import { ConflictException, Controller, ForbiddenException, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user-decorator';

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class CloseUserReportController {
  constructor(private readonly prisma: PrismaService) {}

  @Patch('user/:id/report/:year/:month/closed')
  @HttpCode(200)
  async handle(@Param('year') year: number, @Param('month') month: number, @Param('id') id: string, @CurrentUser() jwt: { resources: string[] }): Promise<any> {
    if (!jwt.resources.includes('PATCH_USER')) {
      throw new ForbiddenException('Access denied');
    }

    const userPayment = await this.prisma.payment.findFirst({
      where: {
        id_user: id,
        month: Number(month),
        year: Number(year),
      },
    });

    if (userPayment) {
      throw new ConflictException('User payments already exists.');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    const periodsResponse = await this.prisma.release.findMany({
      where: {
        id_user: id,
      },
    });

    // Filtrar os períodos para o mês e ano específicos e calcular o total de horas
    const totalHours = periodsResponse
      .filter((period) => {
        const periodDate = new Date(period.date);
        return periodDate.getFullYear() === year && periodDate.getMonth() === month - 1;
      })
      .reduce((sum, period) => sum + Number(period.total), 0);

    const userBankHour = await this.prisma.bankHour.findUnique({
      where: {
        id_user: id,
      },
    });

    // Calcular o valor total do pagamento
    const totalValue = Number(totalHours) * (user?.hourValue || 0);

    await this.prisma.payment.create({
      data: {
        id: uuidv4(),
        id_user: user?.id ?? id,
        year: Number(year),
        month: Number(month),
        total_hours: Number(totalHours),
        total_value: totalValue,
        hour_value: Number(user?.hourValue),
        payment_date: new Date(),
        current_time_bank: Number(userBankHour?.hour),
      },
    });

    return {
      name: user?.name,
      team: user?.team,
      bankHours: user?.hasBankHours,
      calendar: {
        year: year,
        month: month,
      },
      pay: {
        date: new Date(),
        hour: user?.hourValue,
        total: totalValue,
      },
    };
  }
}
