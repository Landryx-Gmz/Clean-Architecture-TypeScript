// TODO: Use-case CreateOrder
// Nombre con verbo en PascalCase: CreateOrder
// Debe depender solo de domain y de puertos (interfaces) en application/ports

import type { CreateOrderDTO } from "../dtos/CreateOrderDTO.js";
import { Order } from "../../domain/entities/Order.js";
import type { OrderRepository } from "../ports/OrderRepository.js";

export class CreateOrder {
    constructor(private readonly repo: OrderRepository) { }

    async execute(dto: CreateOrderDTO): Promise<Order> {
        const order = new Order(dto.id);
        await this.repo.save(order);
        return order;
    }
}
