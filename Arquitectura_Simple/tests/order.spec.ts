import { describe, expect, it } from 'vitest';
import { Order } from '@domain/entities/Order';
import { OrderId } from '@domain/value-objects/OrderId';
import { OrderItem } from '@domain/value-objects/OrderItem';
import { Money } from '@domain/value-objects/Money';
import { SKU } from '@domain/value-objects/SKU';
import type { Currency } from '@domain/value-objects/Currency';
import {
    ItemAddedToOrder,
    OrderCreated,
    OrderTotalRecalculated,
} from '@domain/events/OrderEvents';

describe('Order aggregate', () => {
    it('emits OrderCreated when created', () => {
        const currency: Currency = 'USD';
        const orderId = new OrderId('ORD-123');

        const order = Order.create(orderId, currency);

        const events = order.pullEvents();
        expect(events).toHaveLength(1);

        const created = events[0]!;
        expect(created).toBeInstanceOf(OrderCreated);
        expect(created).toMatchObject({ orderId: orderId.value, currency });
        expect(created.type).toBe('order.created');
        expect(created.occurredAt).toBeInstanceOf(Date);
    });

    it('records item added and total recalculated when adding an item', () => {
        const currency: Currency = 'USD';
        const order = Order.create(new OrderId('ORD-456'), currency);
        order.pullEvents(); // limpiamos eventos de creación para aislar los siguientes

        const item = OrderItem.of(new SKU('abc-123'), Money.of(10, currency), 2);

        order.addItem(item);

        const events = order.pullEvents();
        expect(events).toHaveLength(2);

        const added = events[0]!;
        const total = events[1]!;
        expect(added).toBeInstanceOf(ItemAddedToOrder);
        expect(added).toMatchObject({
            orderId: order.id.value,
            sku: 'ABC-123',
            quantity: 2,
        });
        expect(added.type).toBe('order.item_added');

        expect(total).toBeInstanceOf(OrderTotalRecalculated);
        expect(total).toMatchObject({
            orderId: order.id.value,
            total: 20,
            currency,
        });
        expect(total.type).toBe('order.total_recalculated');
    });
});
