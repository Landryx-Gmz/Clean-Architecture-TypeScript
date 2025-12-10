// TODO: Adapter: InMemoryOrderRepository
// Sufijo técnico: InMemoryOrderRepository
// Implementa el puerto OrderRepository usando persistencia en memoria

import type { OrderRepository } from "../../application/ports/OrderRepository.js";
import type { Order } from "../../domain/entities/Order.js";

export class InMemoryOrderRepository implements OrderRepository {
    private store = new Map<string, Order>();

    async save(order: Order): Promise<void> {
        this.store.set(order.id, order);
    }

    async findById(id: string): Promise<Order | null> {
        return this.store.get(id) ?? null;
    }
}
