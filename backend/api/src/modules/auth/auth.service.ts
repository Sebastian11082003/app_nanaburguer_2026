import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ============================
  // REGISTER
  // ============================
  async register(dto: RegisterDto, restaurantId: string) {
    try {
      // 🔎 validar si ya existe usuario en ese restaurante
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
          restaurantId,
        },
      });

      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      // 🔐 hash password
      const passwordHash = await bcrypt.hash(dto.password, 10);

      // 🧱 crear usuario
      const user = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          passwordHash,
          role: dto.role ?? UserRole.WAITER,
          isActive: true,
          restaurantId,
        },
      });

      // 🎟 JWT payload consistente
      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      };

      return {
        accessToken: await this.jwt.signAsync(payload),
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email already registered');
      }

      console.error('REGISTER ERROR:', error);
      throw new InternalServerErrorException('Could not register user');
    }
  }

  // ============================
  // LOGIN (MULTI-TENANT SAFE)
  // ============================
  async login(email: string, password: string, restaurantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        restaurantId,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
