import { describe, it, expect, beforeEach } from "vitest";
import { CreateOrder } from "../../../src/application/use-cases/CreateOrder.js";
import { InMemoryOrderRepository } from "../../../src/infrastructure/adapters/InMemoryOrderRepository.js";

describe("CreateOrder use-case", () => {
    let createOrder: CreateOrder;
    let repository: InMemoryOrderRepository;

    beforeEach(() => {
        repository = new InMemoryOrderRepository();
        createOrder = new CreateOrder(repository);
    });

    it("should create a new order successfully", async () => {
        const dto = { id: "order-123" };
        const result = await createOrder.execute(dto);

        expect(result.id).toBe("order-123");
        expect(result.items).toEqual([]);
        expect(result.calculateTotal()).toBe(0);
    });

    it("should persist the order in the repository", async () => {
        const dto = { id: "order-456" };
        await createOrder.execute(dto);

        const retrieved = await repository.findById("order-456");
        expect(retrieved).not.toBeNull();
        expect(retrieved?.id).toBe("order-456");
    });

    it("should return an Order entity with domain methods", async () => {
        const dto = { id: "order-789" };
        const result = await createOrder.execute(dto);

        expect(typeof result.calculateTotal).toBe("function");
        expect(result.calculateTotal()).toBe(0);
    });
});
