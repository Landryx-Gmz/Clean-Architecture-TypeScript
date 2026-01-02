import { DomainEvent } from '@domain/events/DomainEvent';

export class OrderCreated extends DomainEvent {
    readonly type = 'order.created';

    constructor(public readonly orderId: string, public readonly currency: string) {
        super(orderId);
    }
}
