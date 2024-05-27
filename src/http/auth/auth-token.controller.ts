import { Body, Controller, Post, UnauthorizedException, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller('/v1/auth')
export class AuthTokenController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('token')
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async login(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User credentials do not match.');
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('User credentials do not match.');
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
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
    return this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '24h' });
  }

  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwt.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });
  }
}
