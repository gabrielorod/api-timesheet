import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DateValidator } from '../../utils/DateValidator';
import { CurrentUser } from '../../auth/current-user-decorator';

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class ListHolidayController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('holiday')
  async handle(@CurrentUser() jwt: { resources: string[] }) {
    if (!jwt.resources.includes('GET_HOLIDAY')) {
      throw new ForbiddenException('Access denied');
    }

    const holidays = await this.prisma.holiday.findMany({
      select: {
        year: true,
        date: true,
      },
    });

    const groupedHolidays = holidays.reduce((acc, holiday) => {
      const year = holiday.year;
      const date = DateValidator.dateToStrBR(holiday.date);

      if (!acc[year]) {
        acc[year] = {
          year: year,
          days: [],
        };
      }
      acc[year].days.push(date);
      return acc;
    }, {});

    return Object.values(groupedHolidays);
  }
}
