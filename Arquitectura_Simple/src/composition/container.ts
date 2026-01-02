import { CreateOrderUseCase } from '@application/use-case/CreateOrder';
import { AddItemToOrderUseCase } from '@application/use-case/AddItemToOrder';
import type { ServerDependencies } from '@application/ports/ServerDependencies';
import type { Clock } from '@application/ports/Clock';
import type { OrderRepository } from '@application/ports/OrderRepository';
import type { PricingService } from '@application/ports/PricingService';
import type { EventBus } from '@application/ports/EventBus';
import { InMemoryOrderRepository } from '@infrastructure/persistence/in-memory/InMemoryOrderRepository';
import { StaticPricingService } from '@infrastructure/http/StaticPricingService';
import { NoopEventBus } from '@infrastructure/messaging/NoopEventBus';

export type Dependencies = ServerDependencies & {
    orderRepository: OrderRepository;
    pricingService: PricingService;
    eventBus: EventBus;
};

export const buildContainer = (): Dependencies => {
    const orderRepository = new InMemoryOrderRepository();
    const pricingService = new StaticPricingService();
    const eventBus = new NoopEventBus();
    const clock: Clock = { now: () => new Date() };

    const createOrderUseCase = new CreateOrderUseCase({
        repository: orderRepository,
        pricing: pricingService,
        eventBus,
        clock,
    });

    const addItemToOrderUseCase = new AddItemToOrderUseCase({
        repository: orderRepository,
        pricing: pricingService,
        eventBus,
        clock,
    });

    return {
        orderRepository,
        pricingService,
        eventBus,
        createOrderUseCase,
        addItemToOrderUseCase,
    };
};