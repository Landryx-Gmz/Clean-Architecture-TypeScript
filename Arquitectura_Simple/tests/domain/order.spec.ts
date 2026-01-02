import { describe, expect, it } from 'vitest';
import { Order } from '@domain/entities/Order';
import { OrderId } from '@domain/value-objects/OrderId';
import { OrderItem } from '@domain/value-objects/OrderItem';
import { Money } from '@domain/value-objects/Money';
import { SKU } from '@domain/value-objects/SKU';
import type { Currency } from '@domain/value-objects/Currency';
import { CurrencyMismatchError } from '@domain/errors/CurrencyMismatchError';
import {
    ItemAddedToOrder,
    OrderCreated,
    OrderTotalRecalculated,
} from '@domain/events/OrderEvents';

const USD: Currency = 'USD';
const EUR: Currency = 'EUR';

const makeItem = (sku: string, unit: number, currency: Currency, qty: number) =>
    OrderItem.of(new SKU(sku), Money.of(unit, currency), qty);

describe('Order aggregate', () => {
    it('emits OrderCreated when created', () => {
        // Creation should emit OrderCreated domain event
        const order = Order.create(new OrderId('ORD-123'), USD);

        const events = order.pullEvents();
        expect(events).toHaveLength(1);

        const created = events[0]!;
        expect(created).toBeInstanceOf(OrderCreated);
        expect(created).toMatchObject({ orderId: 'ORD-123', currency: USD });
        expect(created.type).toBe('order.created');
        expect(created.occurredAt).toBeInstanceOf(Date);
    });

    it('records item added and total recalculated when adding an item', () => {
        // Adding an item should emit item-added and total-recalculated events
        const order = Order.create(new OrderId('ORD-456'), USD);
        order.pullEvents();

        const item = OrderItem.of(new SKU('abc-123'), Money.of(10, USD), 2);

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
            currency: USD,
        });
        expect(total.type).toBe('order.total_recalculated');
    });

    it('merges quantity when adding same SKU and currency', () => {
        // Same SKU+currency should merge quantities instead of duplicating lines
        const order = Order.create(new OrderId('ORD-merge'), USD);
        order.pullEvents();

        order.addItem(makeItem('ABC-1', 10, USD, 1));
        order.addItem(makeItem('ABC-1', 10, USD, 2));

        const items = order.getItems();
        expect(items).toHaveLength(1);
        expect(items[0]?.quantity).toBe(3);
        expect(order.total().amount).toBe(30);
    });

    it('keeps separate lines for different SKUs', () => {
        // Different SKUs should remain separate line items
        const order = Order.create(new OrderId('ORD-lines'), USD);
        order.pullEvents();

        order.addItem(makeItem('A-1', 5, USD, 1));
        order.addItem(makeItem('B-1', 7, USD, 2));

        const items = order.getItems();
        expect(items).toHaveLength(2);
        expect(order.total().amount).toBe(19);
    });

    it('throws on currency mismatch', () => {
        // Adding item with mismatched currency should raise CurrencyMismatchError
        const order = Order.create(new OrderId('ORD-curr'), USD);
        order.pullEvents();

        expect(() => order.addItem(makeItem('A-1', 5, EUR, 1))).toThrow(CurrencyMismatchError);
    });
});
