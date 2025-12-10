// TODO: Use-case AddItemToOrder
// Verbo en PascalCase: AddItemToOrder

import type { AddItemDTO } from "../dtos/AddItemDTO.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import type { Price } from "../../domain/value-objects/Price.js";

export class AddItemToOrder {
    constructor(private readonly repo: OrderRepository) { }

    async execute(dto: AddItemDTO, price: Price) {
        const order = await this.repo.findById(dto.orderId);
        if (!order) throw new Error('Order not found');
        // TODO: delegar reglas al agregado Order
        order.items.push({ sku: dto.sku, quantity: dto.quantity, price: price.amount });
        await this.repo.save(order);
        return order;
    }
}
