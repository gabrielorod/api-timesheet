import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class IsAliveController {
  @Get('/is-alive')
  @HttpCode(200)
  async handle() {
    return 'OK!';
  }
}
