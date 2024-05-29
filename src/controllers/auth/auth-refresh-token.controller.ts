import { Body, Controller, Post, UnauthorizedException, UsePipes } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ZodValidationPipe } from '../pipes/zod-validation-pipe';
import { z } from 'zod';
import { PrismaService } from '../../prisma/prisma.service';

const refreshTokenBodySchema = z.object({
  refreshToken: z.string(),
});

type RefreshTokenBodySchema = z.infer<typeof refreshTokenBodySchema>;

@Controller('/v1/auth')
export class AuthRefreshTokenController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Post('/refresh-token')
  @UsePipes(new ZodValidationPipe(refreshTokenBodySchema))
  async refreshToken(@Body() body: RefreshTokenBodySchema) {
    const { refreshToken } = body;

    const userId = await this.verifyRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const resources = await this.prisma.resource.findMany({
      where: {
        resource_groups: {
          some: {
            id_group: user.id_group,
          },
        },
      },
      select: {
        name: true,
      },
    });

    const resourceNames = resources.map((resource) => resource.name);

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      team: user.team,
      groupId: user.id_group,
      resources: resourceNames,
    };

    const accessToken = this.generateAccessToken(payload);
    const expiresIn = this.jwt.decode(accessToken).exp - Math.floor(Date.now() / 1000);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      tokenType: 'Bearer',
      expiresIn: expiresIn,
    };
  }

  private generateAccessToken(payload: object): string {
    return this.jwt.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '7d' });
  }

  private async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const decoded = this.jwt.verify(token, { secret: process.env.JWT_REFRESH_SECRET });
      return decoded.id;
    } catch (error) {
      return null;
    }
  }
}
