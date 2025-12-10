// TODO: Domain Event: OrderCreated
// Se dispara cuando se crea una nueva orden
// Listeners pueden reaccionar: enviar email, actualizar analytics, etc.

import { DomainEvent } from "./DomainEvent.js";

export class OrderCreated extends DomainEvent {
    constructor(readonly orderId: string) {
        super();
    }

    getEventType(): string {
        return "OrderCreated";
    }
}
