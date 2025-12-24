import { DomainEvent } from '@domain/events/DomainEvent';

export class OrderCreated extends DomainEvent {
    readonly type = 'order.created';
    constructor(public readonly orderId: string, public readonly currency: string) {
        super();
    }
}

export class ItemAddedToOrder extends DomainEvent {
    readonly type = 'order.item_added';
    constructor(
        public readonly orderId: string,
        public readonly sku: string,
        public readonly quantity: number,
    ) {
        super();
    }
}

export class OrderTotalRecalculated extends DomainEvent {
    readonly type = 'order.total_recalculated';
    constructor(
        public readonly orderId: string,
        public readonly total: number,
        public readonly currency: string,
    ) {
        super();
    }
}


