import { DomainEvent } from '@domain/events/DomainEvent.js'
import { Result } from '@shared/Result.js'
import { AppError } from '@application/errors.js'

export interface EventBus {
  publish(events: DomainEvent[]): Promise<Result<void, AppError>>
}