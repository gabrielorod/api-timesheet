import { BadRequestException, Body, Controller, HttpCode, Post, UseGuards, UsePipes } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

// esquema de validação usando o Zod.
const createHolidayBodySchema = z.object({
  year: z.number(),
  // Deve ser um número.
  days: z.array(z.string().transform((str) => new Date(str))),
  // Deve ser um array de strings que serão convertidos para objetos Date.
});

type CreateHolidayBodySchema = z.infer<typeof createHolidayBodySchema>;

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class CreateHolidayController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('/holiday')
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(createHolidayBodySchema))
  async handle(@Body() body: CreateHolidayBodySchema): Promise<void> {
    const { year, days } = body;

    const existingHolidays = await this.prisma.holiday.findMany({
      where: { date: { in: days.map((day) => new Date(day)) } },
    });

    if (existingHolidays.length > 0) {
      throw new BadRequestException('Holiday already exists for provided year and dates.');
    }

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