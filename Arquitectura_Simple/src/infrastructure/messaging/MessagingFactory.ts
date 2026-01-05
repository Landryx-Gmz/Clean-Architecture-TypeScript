import { type EventBus } from '@application/ports/EventBus';
import { OutboxEventBus } from '@infrastructure/messaging/OutboxEventBus';
import { NoopEventBus } from '@infrastructure/messaging/NoopEventBus';
import { OutboxDispatcher } from '@infrastructure/messaging/OutboxDistpatcher';
import { DatabaseFactory } from '@infrastructure/database/DatabaseFactory';

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