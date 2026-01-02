import { DomainEvent } from '@domain/events/DomainEvent';

export class OrderTotalRecalculated extends DomainEvent {
    readonly type = 'order.total_recalculated';

    constructor(
        public readonly orderId: string,
        public readonly total: number,
        public readonly currency: string,
    ) {
        super(orderId);
    }
}
