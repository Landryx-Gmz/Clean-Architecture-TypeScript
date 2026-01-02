import { DomainEvent } from '@domain/events/DomainEvent';

export class ItemAddedToOrder extends DomainEvent {
    readonly type = 'order.item_added';

    constructor(
        public readonly orderId: string,
        public readonly sku: string,
        public readonly quantity: number,
    ) {
        super(orderId);
    }
}
