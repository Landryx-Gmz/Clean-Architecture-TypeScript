import { DomainEvent } from '@domain/events/DomainEvent.js'

export class OrderCreated extends DomainEvent {
  constructor(orderSku: string) {
    super(orderSku)
  }
}