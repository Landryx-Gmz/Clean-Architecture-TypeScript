// TODO: Port: OrderRepository
// Nombre de puerto: OrderRepository (dominio + sufijo Repository)
// Este archivo define la interfaz que implementarán los adaptadores de infraestructura.

import type { Order } from "../../domain/entities/Order.js";

export interface OrderRepository {
    save(order: Order): Promise<void>;
    findById(id: string): Promise<Order | null>;
}
