import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('/v1')
@UseGuards(JwtAuthGuard)
export class ListGroupController {
  constructor(private prisma: PrismaService) {}

  @Get('/group')
  async handle() {
    return this.prisma.group.findMany();
  }
}
