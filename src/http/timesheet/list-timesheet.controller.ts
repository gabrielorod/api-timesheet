import { Controller, ForbiddenException, Get, HttpCode, Param, UseGuards, UsePipes } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user-decorator';

const getTimesheetBodySchema = z.object({
  year: z.number(),
  month: z.number(),
});

type GetTimesheetBodySchema = z.infer<typeof getTimesheetBodySchema>;

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class CreateTimesheetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('timesheet/:year/:month')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(getTimesheetBodySchema))
  async getTimesheet(
    @Param('year') year: number,
    @Param('month') month: number,
    @CurrentUser()
    jwt: {
      id: string;
      resources: string[];
    },
  ) {
    if (!jwt.resources.includes('GET_TIMESHEET')) {
      throw new ForbiddenException('Access denied');
    }

    const periodsResponse = await this.prisma.release.findMany({
      where: {
        id_user: jwt.id,
      },
    });

    return {
      closed: '',
      month: '',
      year: '',
      total: '',
      balance: '',
      days: {
        date: '',
        businessDay: '',
        period: periodsResponse.map((el) => {
          return {
            start: el.start_hour,
            end: el.end_hour,
            description: el.description,
          };
        }),
        total: '',
      }[0],
    };
  }
}
