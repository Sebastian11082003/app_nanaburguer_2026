import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCashMovementDto,
    restaurantId: string,
    userId: string,
  ) {
    return this.prisma.cashMovement.create({
      data: {
        type: dto.type,
        concept: dto.concept,
        reference: dto.reference,
        amountCents: dto.amountCents,
        restaurantId,
        createdById: userId,
      },
    });
  }

  async findAll(restaurantId: string) {
    return this.prisma.cashMovement.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
    });
  }
}
