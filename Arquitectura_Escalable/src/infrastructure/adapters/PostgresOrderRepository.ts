// TODO: Adapter: PostgresOrderRepository
// Sufijo técnico: PostgresOrderRepository
// Implementación concreta con DB (stub)

import type { OrderRepository } from "../../application/ports/OrderRepository.js";
import type { Order } from "../../domain/entities/Order.js";
import type { OrderModel } from "../persistence/order.model.js";

export class PostgresOrderRepository implements OrderRepository {
    async save(order: Order): Promise<void> {
        const model: OrderModel = { id: order.id, items: order.items };
        // TODO: persistir model en Postgres
        throw new Error('Not implemented');
    }

    async findById(id: string): Promise<Order | null> {
        // TODO: recuperar desde DB y mapear a Order
        return null;
    }
}
