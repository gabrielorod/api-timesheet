import { BadRequestException, Body, Controller, ForbiddenException, HttpCode, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user-decorator';
import { differenceInHours } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const createTimesheetBodySchema = z.object({
  period: z.array(
    z.object({
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
  @UsePipes(new ZodValidationPipe(createTimesheetBodySchema))
  async handle(
    @Param('year') year: number,
    @Param('month') month: number,
    @Param('day') day: number,
    @Body() body: CreateTimesheetBodySchema,
    @CurrentUser()
    jwt: {
      resources: string[];
    },
  ): Promise<void> {
    if (!jwt.resources.includes('POST_TIMESHEET')) {
      throw new ForbiddenException('Access denied');
    }

    // Check closed month
    const isMonthClosed = await this.isMonthClosed(year, month);
    if (isMonthClosed) {
      throw new BadRequestException('Month is closed');
    }

    // Validate time ranges
    body.period.forEach((period) => {
      const startHour = new Date(period.start).getHours();
      const endHour = new Date(period.end).getHours();
      if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
        throw new BadRequestException('Invalid time range');
      }
    });

    // Validate time order (start < end)
    body.period.forEach((period) => {
      const startTime = new Date(period.start).getTime();
      const endTime = new Date(period.end).getTime();
      if (endTime <= startTime) {
        throw new BadRequestException('End time must be greater than start time');
      }
    });

    // Validate overlapping periods
    for (let i = 0; i < body.period.length; i++) {
      for (let j = i + 1; j < body.period.length; j++) {
        const start1 = new Date(body.period[i].start).getTime();
        const end1 = new Date(body.period[i].end).getTime();
        const start2 = new Date(body.period[j].start).getTime();
        const end2 = new Date(body.period[j].end).getTime();

        if ((start1 >= start2 && start1 < end2) || (end1 > start2 && end1 <= end2)) {
          throw new BadRequestException('Time ranges cannot overlap');
        }
      }
    }

    const date = new Date(year, month - 1, day);

    const existingTimesheet = await this.prisma.release.findFirst({
      where: {
        date,
      },
    });

    if (existingTimesheet) {
      return await this.updateTimesheet(year, existingTimesheet.id, body);
    }

    const data = { year, month, day };
    return await this.createTimesheet(data, jwt, body);
  }

  private async isMonthClosed(year: number, month: number): Promise<boolean> {
    const currentDate = new Date();
    const inputDate = new Date(year, month - 1);

    return inputDate < new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }

  private async createTimesheet(date: any, jwt: any, body: CreateTimesheetBodySchema) {
    const holidays = await this.getHolidays(date.year);

    const periods = body.period.map((el) => {
      const start = new Date(el.start);
      const end = new Date(el.end);

      // Check if the period is a holiday and apply default hours if applicable
      const isHoliday = holidays.some((holiday) => holiday.date === start.toISOString().slice(0, 10));
      const holidayStart = isHoliday ? new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8, 0) : start;
      const holidayEnd = isHoliday ? new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12, 0) : end;

      return {
        start: holidayStart.toISOString(),
        end: holidayEnd.toISOString(),
        description: el.description,
      };
    });

    for (const period of periods) {
      const startTime = new Date(period.start);
      const endTime = new Date(period.end);
      const timeDifference = differenceInHours(endTime, startTime);

      await this.prisma.release.create({
        data: {
          id: uuidv4(),
          id_user: jwt.id,
          date: new Date(date.year, date.month - 1, date.day),
          holiday: '',
          total: String(timeDifference),
          start_hour: period.start,
          end_hour: period.end,
          description: period.description,
        },
      });
    }
  }

  private async updateTimesheet(year: number, releaseId: string, body: CreateTimesheetBodySchema) {
    const total = String(this.calculateTotalTime(body.period));
    const holidays = await this.getHolidays(year);

    const periods = body.period.map((period) => {
      const start = new Date(period.start);
      const end = new Date(period.end);

      const isHoliday = holidays.some((holiday) => holiday.date === start.toISOString().slice(0, 10));
      const holidayStart = isHoliday ? new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8, 0) : start;
      const holidayEnd = isHoliday ? new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12, 0) : end;

      return {
        start: holidayStart.toISOString(),
        end: holidayEnd.toISOString(),
        description: period.description,
      };
    });

    for (const period of periods) {
      await this.prisma.release.update({
        where: {
          id: releaseId,
        },
        data: {
          total,
          start_hour: period.start,
          end_hour: period.end,
          description: period.description,
        },
      });
    }
  }

  private async getHolidays(year: number): Promise<any> {
    return this.prisma.holiday.findMany({
      where: {
        year,
      },
    });
  }

  private calculateTotalTime(periods: { start: string; end: string }[]): number {
    let totalTime = 0;
    for (const period of periods) {
      const startTime = new Date(period.start);
      const endTime = new Date(period.end);
      const timeDifference = differenceInHours(endTime, startTime);
      totalTime += timeDifference;
    }
    return totalTime;
  }
}
