import { BadRequestException, Body, Controller, Post, Put, UnauthorizedException, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

const putRecoverPasswordSchema = z.object({
  hash: z.string().uuid(),
  code: z.string().length(5),
  password: z.string().min(8).max(32),
});

type PutRecoverPasswordBody = z.infer<typeof putRecoverPasswordSchema>;

@Controller('/v1/auth')
export class AuthTokenController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('/token')
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

  @Put('/recover-password')
  @UsePipes(new ZodValidationPipe(putRecoverPasswordSchema))
  async resetPassword(@Body() body: PutRecoverPasswordBody) {
    const { hash, code, password } = body;

    const recoverPassword = await this.prisma.recoverPassword.findUnique({
      where: { id: hash },
    });

    if (!recoverPassword) {
      throw new BadRequestException('Invalid fields.');
    }

    if (code !== recoverPassword.code) {
      throw new BadRequestException('Invalid fields.');
    }

    const hashedPassword = await this.generateHash(password);

    await this.prisma.user.update({
      where: { id: recoverPassword.id_user },
      data: { password: hashedPassword },
    });

    await this.prisma.recoverPassword.delete({ where: { id: recoverPassword.id } });
  }

  private async generateHash(password: string): Promise<string> {
    return await hash(password, 8);
  }

  private generateAccessToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '24H' });
  }

  private generateRefreshToken(userId: string): string {
    const payload = { sub: userId };
    return this.jwt.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });
  }
}
