import { Body, Controller, Post, UnauthorizedException, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';

const refreshTokenBodySchema = z.object({
  refreshToken: z.string(),
});

type RefreshTokenBodySchema = z.infer<typeof refreshTokenBodySchema>;

@Controller('/v1/auth')
export class AuthRefreshTokenController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('/refresh-token')
  @UsePipes(new ZodValidationPipe(refreshTokenBodySchema))
  async refreshToken(@Body() body: RefreshTokenBodySchema) {
    const { refreshToken } = body;

    const userId = await this.verifyRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const accessToken = this.generateAccessToken(userId);
    const expiresIn = this.jwt.decode(accessToken).exp - Math.floor(Date.now() / 1000);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: 'Bearer',
      expiresIn: expiresIn,
    };
  }
  private generateAccessToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '24H' });
  }

  private async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const decoded = this.jwt.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
      return decoded.sub;
    } catch (error) {
      return null;
    }
  }
}
