import { EventBus } from '@application/ports/EventBus.js'
import { OutboxEventBus } from '@infrastructure/messaging/OutboxEventBus.js'
import { NoopEventBus } from '@infrastructure/messaging/NoopEventBus.js'
import { OutboxDispatcher } from '@infrastructure/messaging/OutboxDispatcher.js'
import { DatabaseFactory } from '@infrastructure/database/DatabaseFactory.js'

export class MessagingFactory {
  static createEventBus(type: 'outbox' | 'noop' = 'outbox'): EventBus {
    if (type === 'noop') {
      return new NoopEventBus()
    }

    const pool = DatabaseFactory.createPool()
    return new OutboxEventBus(pool)
  }

  static createOutboxDispatcher(batchSize = 100, intervalMs = 5000): OutboxDispatcher {
    return new OutboxDispatcher(batchSize, intervalMs)
  }
}