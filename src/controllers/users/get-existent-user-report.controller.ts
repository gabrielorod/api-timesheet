import { Controller, ForbiddenException, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user-decorator';

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class GetExistentUserReportController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('user/:id/report/:year/:month')
  @HttpCode(200)
  async getTimesheet(
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('id') id: string,
    @CurrentUser()
    jwt: {
      resources: string[];
    },
  ) {
    if (!jwt.resources.includes('GET_USER')) {
      throw new ForbiddenException('Access denied');
    }

    const periodsResponse = await this.prisma.release.findMany({
      where: {
        id_user: id,
      },
    });

    const paymentResponse = await this.prisma.payment.findFirst({
      where: {
        id_user: id,
        year: Number(year),
        month: Number(month),
      },
    });

    const filteredPeriods = periodsResponse.filter((period) => {
      return {
        date: period.date,
      };
    });

    if (filteredPeriods.length === 0) {
      return {
        closed: '',
        month: paymentResponse?.month ?? month,
        year: paymentResponse?.year ?? year,
        total: paymentResponse?.total_hours ?? '',
        balance: paymentResponse?.total_value ?? '',
        days: [],
      };
    }

    // Agrupar os períodos por data
    const groupedPeriods = filteredPeriods.reduce((acc, period) => {
      const date = period.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        start: period.start_hour,
        end: period.end_hour,
        description: period.description,
      });
      return acc;
    }, {});

    // Mapear os dias com os períodos agrupados
    const days = Object.keys(groupedPeriods).map((date) => {
      const dayPeriods = groupedPeriods[date];
      const dayPeriod = filteredPeriods.find((period) => period.date.toISOString().split('T')[0] === date);
      return {
        date: date,
        businessDay: !dayPeriod?.holiday,
        period: dayPeriods,
        total: dayPeriod?.total,
      };
    });

    return {
      closed: '',
      month: paymentResponse?.month ?? month,
      year: paymentResponse?.year ?? year,
      total: paymentResponse?.total_hours ?? '',
      balance: paymentResponse?.total_value ?? '',
      days: days,
    };
  }
}
