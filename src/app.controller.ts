import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { PrismaService } from "./prisma/prisma.service";

@Controller("/api")
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get("/hello")
  index(): string {
    return this.appService.getHello();
  }

  @Post("/hello")
  async store() {
    return this.prisma.client.user.findMany();
  }
}
