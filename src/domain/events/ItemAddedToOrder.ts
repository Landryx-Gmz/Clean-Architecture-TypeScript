// TODO: Domain Event: ItemAddedToOrder
// Se dispara cuando se añade un item a una orden

import { DomainEvent } from "./DomainEvent.js";

export class ItemAddedToOrder extends DomainEvent {
    constructor(
        readonly orderId: string,
        readonly sku: string,
        readonly quantity: number,
        readonly price: number
    ) {
        super();
    }

    getEventType(): string {
        return "ItemAddedToOrder";
    }
}
