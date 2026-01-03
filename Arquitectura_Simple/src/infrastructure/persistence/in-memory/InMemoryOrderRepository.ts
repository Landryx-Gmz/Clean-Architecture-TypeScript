import type { OrderRepository } from '@application/ports/OrderRepository';
import type { Order } from '@domain/entities/Order';
import type { OrderId } from '@domain/value-objects/OrderId';
import type { Result } from '@shared/Result';
import { ok, fail } from '@shared/Result';
import { notFoundError } from '@application/error';
import type { AppError } from '@application/error';

export class InMemoryOrderRepository implements OrderRepository {
    private readonly orders: Map<string, Order> = new Map();

    async findById(id: OrderId | string): Promise<Result<Order, AppError>> {
        const orderId = typeof id === 'string' ? id : id.value;
        const order = this.orders.get(orderId);
        if (!order) {
            return fail(notFoundError('Order', orderId));
        }
        return ok(order);
    }

    async save(order: Order): Promise<Result<void, AppError>> {
        this.orders.set(order.id.value, order);
        return ok(undefined);
    }

    async exists(id: OrderId): Promise<boolean> {
        return this.orders.has(id.value);
    }
}

