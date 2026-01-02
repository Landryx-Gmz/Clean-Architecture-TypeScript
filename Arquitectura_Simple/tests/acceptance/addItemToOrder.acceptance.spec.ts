import { describe, expect, it, beforeEach } from 'vitest';
import { InMemoryOrderRepository } from '@infrastructure/persistence/in-memory/InMemoryOrderRepository';
import { StaticPricingService } from '@infrastructure/http/StaticPricingService';
import { NoopEventBus } from '@infrastructure/messaging/NoopEventBus';
import { CreateOrderUseCase } from '@application/use-case/CreateOrder';
import { AddItemToOrderUseCase } from '@application/use-case/AddItemToOrder';
import type { Clock } from '@application/ports/Clock';
import { isSuccess } from '@shared/Result';
import type { Currency } from '@domain/value-objects/Currency';
import { OrderId } from '@domain/value-objects/OrderId';

const USD: Currency = 'USD';

describe('AddItemToOrder acceptance (in-memory adapters)', () => {
    let repo: InMemoryOrderRepository;
    let pricing: StaticPricingService;
    let eventBus: NoopEventBus;
    let clock: Clock;
    let createOrder: CreateOrderUseCase;
    let addItemToOrder: AddItemToOrderUseCase;

    beforeEach(() => {
        // Fresh in-memory adapters per test to keep state isolated
        repo = new InMemoryOrderRepository();
        pricing = new StaticPricingService();
        eventBus = new NoopEventBus();
        clock = { now: () => new Date('2024-01-01T00:00:00Z') };

        createOrder = new CreateOrderUseCase({
            repository: repo,
            pricing,
            eventBus,
            clock,
        });

        addItemToOrder = new AddItemToOrderUseCase({
            repository: repo,
            pricing,
            eventBus,
            clock,
        });
    });

    it('creates an order then adds another item, recalculating total', async () => {
        // Happy path: create order, add different SKU, verify total and line items
        const orderId = 'ORD-accept';

        const createResult = await createOrder.execute({
            orderId,
            currency: USD,
            items: [
                { sku: 'MOUSE001', quantity: 1 }, // price: 29.99 USD
            ],
        });

        expect(isSuccess(createResult)).toBe(true);

        const addResult = await addItemToOrder.execute({
            orderId,
            sku: 'KEYBOARD001', // price: 79.99 USD
            quantity: 2,
        });

        expect(isSuccess(addResult)).toBe(true);

        const stored = await repo.findById(new OrderId(orderId));
        expect(stored).not.toBeNull();

        const total = stored?.total();
        expect(total?.currency).toBe(USD);
        // 1 * 29.99 + 2 * 79.99 = 189.97
        expect(total?.amount).toBeCloseTo(189.97, 2);

        const items = stored?.getItems() ?? [];
        expect(items).toHaveLength(2);
        const keyboard = items.find((i) => i?.sku.value === 'KEYBOARD001');
        expect(keyboard?.quantity).toBe(2);
    });

    it('merges quantities when adding same SKU', async () => {
        // Adding same SKU multiple times should merge quantities and update total
        const orderId = 'ORD-merge-accept';

        await createOrder.execute({
            orderId,
            currency: USD,
            items: [
                { sku: 'MOUSE001', quantity: 1 },
            ],
        });

        const firstAdd = await addItemToOrder.execute({
            orderId,
            sku: 'MOUSE001',
            quantity: 2,
        });
        expect(isSuccess(firstAdd)).toBe(true);

        const secondAdd = await addItemToOrder.execute({
            orderId,
            sku: 'MOUSE001',
            quantity: 3,
        });
        expect(isSuccess(secondAdd)).toBe(true);

        const stored = await repo.findById(new OrderId(orderId));
        const item = stored?.getItems()[0];
        expect(item?.quantity).toBe(6);
        // price 29.99 * 6 = 179.94
        expect(stored?.total().amount).toBeCloseTo(179.94, 2);
    });
});
