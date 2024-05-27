import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('/v1/user')
export class GetUserByIdController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  async userById(@Param('id') id: string) {
    return this.prisma.user.findUnique({
      where: { id: id },
    });
  }
}
