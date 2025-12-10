import { describe, it, expect, beforeEach } from "vitest";
import { AddItemToOrder } from "../../../src/application/use-cases/AddItemToOrder.js";
import { CreateOrder } from "../../../src/application/use-cases/CreateOrder.js";
import { InMemoryOrderRepository } from "../../../src/infrastructure/adapters/InMemoryOrderRepository.js";
import { Price } from "../../../src/domain/value-objects/Price.js";

describe("AddItemToOrder use-case", () => {
    let addItemToOrder: AddItemToOrder;
    let createOrder: CreateOrder;
    let repository: InMemoryOrderRepository;

    beforeEach(() => {
        repository = new InMemoryOrderRepository();
        addItemToOrder = new AddItemToOrder(repository);
        createOrder = new CreateOrder(repository);
    });

    it("should add an item to an existing order", async () => {
        const orderId = "order-001";
        await createOrder.execute({ id: orderId });

        const price = new Price(25.5);
        await addItemToOrder.execute(
            { orderId, sku: "SKU-ABC", quantity: 2 },
            price
        );

        const order = await repository.findById(orderId);
        expect(order).toBeDefined();
        if (order) {
            expect(order.items).toHaveLength(1);
            expect(order.items[0]).toBeDefined();
            expect(order.items[0]!.sku).toBe("SKU-ABC");
            expect(order.items[0]!.quantity).toBe(2);
            expect(order.items[0]!.price).toBe(25.5);
        }
    });

    it("should calculate total correctly after adding items", async () => {
        const orderId = "order-002";
        await createOrder.execute({ id: orderId });

        await addItemToOrder.execute(
            { orderId, sku: "ITEM-1", quantity: 3 },
            new Price(10)
        );
        await addItemToOrder.execute(
            { orderId, sku: "ITEM-2", quantity: 2 },
            new Price(15)
        );

        const order = await repository.findById(orderId);
        expect(order).toBeDefined();
        if (order) {
            expect(order.calculateTotal()).toBe(3 * 10 + 2 * 15); // 30 + 30 = 60
        }
    });

    it("should throw error if order does not exist", async () => {
        const price = new Price(10);
        await expect(
            addItemToOrder.execute(
                { orderId: "non-existent", sku: "SKU", quantity: 1 },
                price
            )
        ).rejects.toThrow("Order not found");
    });
});
