import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashed, name: dto.name },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email);
  }

  async refresh(userId: string, email: string, refreshToken: string) {
    // Check if token is blacklisted
    const blacklisted = await this.redis.get(`blacklist:${refreshToken}`);
    if (blacklisted) throw new UnauthorizedException('Token revoked');

    return this.generateTokens(userId, email);
  }

  async logout(refreshToken: string) {
    // Blacklist the refresh token for 7 days
    await this.redis.set(`blacklist:${refreshToken}`, '1', 7 * 24 * 60 * 60);
    return { message: 'Logged out successfully' };
  }

  async updateProfile(userId: string, name?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(currentPass, user.password);
    if (!valid) throw new UnauthorizedException('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET') || 'default_secret',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: (this.config.get<string>('JWT_EXPIRES_IN') || '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.config.get<string>('JWT_REFRESH_SECRET') ||
        'default_refresh_secret',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ||
        '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
