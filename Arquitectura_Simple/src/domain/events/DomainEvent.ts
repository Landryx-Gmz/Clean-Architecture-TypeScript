export abstract class DomainEvent {
    readonly occurredAt: Date;
    readonly aggregateId: string;
    abstract readonly type: string;

    protected constructor(aggregateId: string) {
        this.aggregateId = aggregateId;
        this.occurredAt = new Date();
    }
}


