import { BadRequestException, Body, Controller, ForbiddenException, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { z } from 'zod';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user-decorator';
import { differenceInHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const createTimesheetBodySchema = z.object({
  period: z.array(
    z.object({
      id: z.string().optional(),
      start: z.string(),
      end: z.string(),
      description: z.string(),
    }),
  ),
});

type CreateTimesheetBodySchema = z.infer<typeof createTimesheetBodySchema>;

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class CreateTimesheetController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('timesheet/:year/:month/:day')
  @HttpCode(204)
  async handle(
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
    @Body() body: CreateTimesheetBodySchema,
    @CurrentUser()
    jwt: { id: string; resources: string[] },
  ): Promise<void> {
    if (!jwt.resources.includes('POST_TIMESHEET')) {
      throw new ForbiddenException('Access denied');
    }

    const date = new Date(year, month - 1, day);

    const existingTimesheets = await this.prisma.release.findMany({
      where: {
        date: date,
        id_user: jwt.id,
      },
    });

    const holidays = await this.getHolidays(Number(year));

    this.validatePeriods(body.period);

    for (const period of body.period) {
      const startParts = this.getTimeParts(period.start);
      const endParts = this.getTimeParts(period.end);

      if (!this.isValidTime(startParts) || !this.isValidTime(endParts)) {
        throw new Error('Period values cannot exceed 00:00 and 23:59');
      }

      let startTime = new Date(year, month - 1, day, startParts.hours, startParts.minutes);
      let endTime = new Date(year, month - 1, day, endParts.hours, endParts.minutes);

      const isHoliday = holidays.some((holiday) => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.getFullYear() === date.getFullYear() && holidayDate.getMonth() === date.getMonth() && holidayDate.getDate() === date.getDate();
      });

      if (isHoliday) {
        const defaultStart = { hours: 8, minutes: 0 };
        const defaultEnd = { hours: 17, minutes: 0 };

        const defaultStartTime = new Date(year, month - 1, day, defaultStart.hours, defaultStart.minutes);
        const defaultEndTime = new Date(year, month - 1, day, defaultEnd.hours, defaultEnd.minutes);

        if (startTime < defaultStartTime) {
          startTime = defaultStartTime;
        }

        if (endTime > defaultEndTime) {
          endTime = defaultEndTime;
        }
      }

      const timeDifference = differenceInHours(endTime, startTime);

      const existingTimesheet = existingTimesheets.find((ts) => ts.id === period.id);

      if (existingTimesheet) {
        await this.prisma.release.update({
          where: { id: existingTimesheet.id },
          data: {
            total: String(timeDifference),
            start_hour: period.start,
            end_hour: period.end,
            description: period.description,
          },
        });
      } else {
        await this.prisma.release.create({
          data: {
            id: uuidv4(),
            id_user: jwt.id,
            date: date,
            holiday: isHoliday,
            total: String(timeDifference),
            start_hour: period.start,
            end_hour: period.end,
            description: period.description,
          },
        });
      }
    }
  }

  private async getHolidays(year: number): Promise<any> {
    return this.prisma.holiday.findMany({
      where: { year },
    });
  }

  private isValidTime(timeParts: { hours: number; minutes: number }): boolean {
    return timeParts.hours >= 0 && timeParts.hours <= 23 && timeParts.minutes >= 0 && timeParts.minutes <= 59;
  }

  private getTimeParts(timeStr: string) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  }

  private validatePeriods(periods: any[]): void {
    for (const period of periods) {
      const start = this.getTimeInMinutes(period.start);
      const end = this.getTimeInMinutes(period.end);

      if (start > end) {
        throw new BadRequestException('The period values are inverted');
      }
    }

    const sortedPeriods = periods.slice().sort((a, b) => {
      const startTimeA = this.getTimeInMinutes(a.start);
      const startTimeB = this.getTimeInMinutes(b.start);
      return startTimeA - startTimeB;
    });

    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const currentEnd = this.getTimeInMinutes(sortedPeriods[i].end);
      const nextStart = this.getTimeInMinutes(sortedPeriods[i + 1].start);

      if (currentEnd > nextStart) {
        throw new BadRequestException('Overlapping values ​​are not allowed');
      }
    }
  }

  private getTimeInMinutes(timeStr: string): number {
    const { hours, minutes } = this.getTimeParts(timeStr);
    return hours * 60 + minutes;
  }
}
