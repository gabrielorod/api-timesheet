import { Body, ConflictException, Controller, ForbiddenException, HttpCode, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CurrentUser } from '../../auth/current-user-decorator';

const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  team: z.string(),
  hourValue: z.number(),
  hasBankHours: z.boolean(),
  contractTotal: z.number(),
  groupId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
});

type CreateUserBodySchema = z.infer<typeof createUserBodySchema>;

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class CreateUserController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('user')
  @HttpCode(200)
  // @UsePipes(new ZodValidationPipe(createUserBodySchema))
  async handle(@Body() body: CreateUserBodySchema, @CurrentUser() jwt: { resources: string[] }): Promise<any> {
    if (!jwt.resources.includes('POST_USER')) {
      throw new ForbiddenException('Access denied');
    }

    const { name, email, password, team, hourValue, hasBankHours, contractTotal, groupId, startDate } = body;

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userWithSameEmail) {
      throw new ConflictException('User with same e-mail address already exists.');
    }

    const hashedPassword = await hash(password, 8);

    await this.prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        team,
        hourValue,
        hasBankHours,
        contractTotal,
        id_group: groupId,
        startDate: new Date(startDate),
      },
    });
  }
}
