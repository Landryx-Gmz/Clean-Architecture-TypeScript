import { CurrencyMismatchError } from '@domain/errors/CurrencyMismatchError';
import type { Currency } from '@domain/value-objects/Currency';
import { Money } from '@domain/value-objects/Money';
import { OrderId } from '@domain/value-objects/OrderId';
import { OrderItem } from '@domain/value-objects/OrderItem';
import type { DomainEvent } from '@domain/events/DomainEvent';
import {
    ItemAddedToOrder,
    OrderCreated,
    OrderTotalRecalculated,
} from '@domain/events/OrderEvents';

/**
 * Aggregate Root para la orden de compra.
 */
export class Order {
    readonly id: OrderId;
    private readonly currency: Currency;
    private items: OrderItem[] = [];
    private domainEvents: DomainEvent[] = [];

    private constructor(id: OrderId, currency: Currency) {
        this.id = id;
        this.currency = currency;
    }

    static create(id: OrderId, currency: Currency): Order {
        const order = new Order(id, currency);
        order.record(new OrderCreated(id.value, currency));
        return order;
    }

    addItem(item: OrderItem): void {
        if (item.unitPrice.currency !== this.currency) {
            throw new CurrencyMismatchError(this.currency, item.unitPrice.currency);
        }

        const existingIndex = this.items.findIndex((current) => current.sameProduct(item));
        if (existingIndex >= 0) {
            const existingItem = this.items[existingIndex];
            if (!existingItem) {
                throw new Error('Item inconsistente en la colección');
            }
            this.items[existingIndex] = existingItem.mergeQuantity(item.quantity);
        } else {
            this.items.push(item);
        }

        this.record(new ItemAddedToOrder(this.id.value, item.productId.value, item.quantity));
        const total = this.total();
        this.record(new OrderTotalRecalculated(this.id.value, total.amount, total.currency));
    }

    total(): Money {
        return this.items.reduce(
            (acc, it) => acc.add(it.subtotal()),
            Money.zero(this.currency),
        );
    }

    getItems(): ReadonlyArray<OrderItem> {
        return this.items.slice();
    }

    pullEvents(): DomainEvent[] {
        const events = this.domainEvents;
        this.domainEvents = [];
        return events;
    }

    private record(event: DomainEvent): void {
        this.domainEvents.push(event);
    }
}


