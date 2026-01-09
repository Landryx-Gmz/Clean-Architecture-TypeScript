import { DomainEvent } from './DomainEvent.js'

export class OrderCreated extends DomainEvent {
  constructor(orderSku: string) {
    super(orderSku)
  }
}