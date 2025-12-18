// TODO: Domain Event base class
// Todos los eventos de dominio deben extender esta clase base
// Proporciona timestamp y trazabilidad

export abstract class DomainEvent {
    readonly occurredAt: Date;
    readonly eventId: string;

    constructor() {
        this.occurredAt = new Date();
        this.eventId = `${Date.now()}-${Math.random()}`;
    }

    abstract getEventType(): string;
}
