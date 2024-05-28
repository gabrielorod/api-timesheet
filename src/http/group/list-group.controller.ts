import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../auth/current-user-decorator';

@Controller('/v1')
export class ListGroupController {
  constructor(private prisma: PrismaService) {}

  @Get('group')
  @UseGuards(JwtAuthGuard)
  async handle(@CurrentUser() jwt: { resources: string[] }) {
    if (!jwt.resources.includes('GET_GROUP')) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.group.findMany();
  }
}
