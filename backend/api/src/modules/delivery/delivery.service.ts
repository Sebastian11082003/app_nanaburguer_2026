import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DeliveryStatus, OrderStatus, OrderType } from '@prisma/client';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================
  // 🔎 FIND ALL
  // ============================
  async findAll(restaurantId: string) {
    // Pickup also stores customer data on Delivery. This queue is
    // domicilio only — Llevar is listed from GET /orders?type=PICKUP.
    return this.prisma.delivery.findMany({
      where: {
        restaurantId,
        order: { type: OrderType.DELIVERY },
      },
      include: {
        order: true,
        deliveryUser: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================
  // 🔎 FIND ONE
  // ============================
  async findOne(id: string, restaurantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, restaurantId },
      include: {
        order: true,
        deliveryUser: true,
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    return delivery;
  }

  // ============================
  // 🖨️ MARK PRINTED
  // ============================
  async markPrinted(id: string, restaurantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, restaurantId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    return this.prisma.delivery.update({
      where: { id },
      data: {
        printed: true,
        printedAt: new Date(),
      },
    });
  }

  // ============================
  // 🚚 DISPATCH DELIVERY
  // ============================
  async dispatch(id: string, restaurantId: string, userId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, restaurantId },
      include: { order: true },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    // A CREATED draft has no kitchen ticket yet. Dispatching it put a
    // ghost in the rider queue. CANCELED is the same dead end.
    const orderStatus = delivery.order?.status;
    if (
      orderStatus === OrderStatus.CREATED ||
      orderStatus === OrderStatus.CANCELED
    ) {
      throw new BadRequestException('Order is not ready to dispatch');
    }

    const dispatched = await this.prisma.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.DISPATCHED,
        dispatchedAt: new Date(),
        deliveryUserId: userId,
      },
    });

    // Kitchen lists by order.status. Leaving SENT_TO_KITCHEN/READY
    // after send-out kept the ticket on the KDS while it was on a bike.
    // Prepaid CLOSED stays closed — cobro already happened.
    if (
      delivery.order &&
      delivery.order.status !== OrderStatus.CLOSED &&
      delivery.order.status !== OrderStatus.CANCELED
    ) {
      await this.prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: OrderStatus.OUT_FOR_DELIVERY },
      });
    }

    return dispatched;
  }

  // ============================
  // ✅ MARK AS DELIVERED
  // ============================
  async deliver(id: string, restaurantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, restaurantId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    return this.prisma.delivery.update({
      where: { id },
      data: {
        status: DeliveryStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });
  }

  // ============================
  // 🔄 UPDATE STATUS (fallback)
  // ============================
  async updateStatus(id: string, status: DeliveryStatus, restaurantId: string) {
    const delivery = await this.prisma.delivery.findFirst({
      where: { id, restaurantId },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');

    return this.prisma.delivery.update({
      where: { id },
      data: { status },
    });
  }
}
