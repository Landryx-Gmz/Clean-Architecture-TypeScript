import type { OrderRepository } from '@application/ports/OrderRepository';
import type { Order } from '@domain/entities/Order';
import type { OrderId } from '@domain/value-objects/OrderId';

export class InMemoryOrderRepository implements OrderRepository {
    private readonly orders: Map<string, Order> = new Map();

    async findById(id: OrderId): Promise<Order | null> {
        const order = this.orders.get(id.value);
        return order ?? null;
    }

    async save(order: Order): Promise<void> {
        this.orders.set(order.id.value, order);
    }

    async exists(id: OrderId): Promise<boolean> {
        return this.orders.has(id.value);
    }
}

