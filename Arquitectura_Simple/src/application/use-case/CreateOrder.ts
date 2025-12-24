import { conflictError, infraError, notFoundError, validationError } from '@application/error';
import type { CreateOrderDTO } from '@application/dto/CreateOrderDTO';
import { fail, ok, type Result } from '@shared/Result';
import type { EventBus } from '@application/ports/EventBus';
import type { Clock } from '@application/ports/Clock';
import type { OrderRepository } from '@application/ports/OrderRepository';
import type { PricingService } from '@application/ports/PricingService';
import { Order } from '@domain/entities/Order';
import { DomainError } from '@domain/errors/DomainError';
import { OrderId } from '@domain/value-objects/OrderId';
import { SKU } from '@domain/value-objects/SKU';
import { OrderItem } from '@domain/value-objects/OrderItem';
import type { AppError } from '@application/error';

type Dependencies = {
    readonly repository: OrderRepository;
    readonly pricing: PricingService;
    readonly eventBus: EventBus;
    readonly clock: Clock;
};

export class CreateOrderUseCase {
    constructor(private readonly deps: Dependencies) {}

    async execute(input: CreateOrderDTO): Promise<Result<Order, AppError>> {
        try {
            const orderId = new OrderId(input.orderId);
            const order = Order.create(orderId, input.currency);

            if (input.items?.length) {
                for (const item of input.items) {
                    const sku = new SKU(item.sku);
                    const unitPrice = await this.deps.pricing.getUnitPrice(sku, input.currency);
                    const orderItem = OrderItem.of(sku, unitPrice, item.quantity);
                    order.addItem(orderItem);
                }
            }

            const events = order.pullEvents();
            await this.deps.repository.save(order);
            await this.deps.eventBus.publish(events);

            return ok(order);
        } catch (error) {
            return fail(mapToAppError(error, 'orden', input.orderId));
        }
    }
}

const isAppError = (error: unknown): error is AppError => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'type' in error &&
        typeof (error as { type?: unknown }).type === 'string'
    );
};

const mapToAppError = (error: unknown, resource: string, id?: string): AppError => {
    if (isAppError(error)) {
        return error;
    }

    if (error instanceof DomainError) {
        return validationError(error.message, undefined, error);
    }

    if (error instanceof Error) {
        if (error.name === 'ConflictError') {
            return conflictError(error.message, resource, id);
        }

        if (error.message?.toLowerCase().includes('not found')) {
            return notFoundError(resource, id);
        }

        return infraError(error.message, error);
    }

    return infraError('Error inesperado', error);
};

