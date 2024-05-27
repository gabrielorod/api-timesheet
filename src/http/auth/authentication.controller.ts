import { BadRequestException, Body, Controller, HttpCode, Post, Put, UnauthorizedException, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

const refreshTokenBodySchema = z.object({
  refreshToken: z.string(),
});

type RefreshTokenBodySchema = z.infer<typeof refreshTokenBodySchema>;

const postRecoverPasswordSchema = z.object({
  email: z.string(),
});

type PostRecoverPasswordBody = z.infer<typeof postRecoverPasswordSchema>;

const putRecoverPasswordSchema = z.object({
  hash: z.string().uuid(),
  code: z.string().length(5),
  password: z.string().min(8).max(32),
});

type PutRecoverPasswordBody = z.infer<typeof putRecoverPasswordSchema>;

@Controller('/v1/auth')
export class AuthenticateController {
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

  @Post('/recover-password')
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(postRecoverPasswordSchema))
  async initiatePasswordReset(@Body() body: PostRecoverPasswordBody) {
    const { email } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid field.');
    }

    const code = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;

    await this.prisma.recoverPassword.create({
      data: {
        id: uuidv4(),
        id_user: user.id,
        code: String(code),
      },
    });
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

  private async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const decoded = this.jwt.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
      return decoded.sub;
    } catch (error) {
      return null;
    }
  }
}
