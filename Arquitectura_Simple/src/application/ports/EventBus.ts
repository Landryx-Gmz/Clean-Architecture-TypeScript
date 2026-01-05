import type { DomainEvent } from '@domain/events/DomainEvent';
import type { Result } from '@shared/Result';
import type { AppError } from '@application/error';

export interface EventBus {
    publish(events: DomainEvent[]): Promise<Result<void, AppError>>;
}

