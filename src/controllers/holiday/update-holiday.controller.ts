import { Body, Controller, ForbiddenException, HttpCode, Put, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user-decorator';

const updateHolidayBodySchema = z.object({
  days: z.array(z.string().transform((str) => new Date(str))),
});

type UpdateHolidayBodySchema = z.infer<typeof updateHolidayBodySchema>;

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class UpdateHolidayController {
  constructor(private readonly prisma: PrismaService) {}

  @Put('holiday/:year')
  @HttpCode(204)
  // @UsePipes(new ZodValidationPipe(updateHolidayBodySchema))
  async handle(@Body() body: UpdateHolidayBodySchema, @CurrentUser() jwt: { resources: string[] }, year: number): Promise<void> {
    if (!jwt.resources.includes('PUT_HOLIDAY')) {
      throw new ForbiddenException('Access denied');
    }

    const { days } = body;

    await this.prisma.holiday.deleteMany({
      where: {
        year: year,
      },
    });

    const holidaysToCreate = days.map((day) => ({
      id: uuidv4(),
      year,
      date: new Date(day),
    }));

    await this.prisma.holiday.createMany({
      data: holidaysToCreate,
    });
  }
}
