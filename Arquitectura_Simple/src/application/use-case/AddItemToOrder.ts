import { conflictError, infraError, notFoundError, validationError } from '@application/error';
import type { AddItemToOrderDTO } from '@application/dto/AddItemToOrderDTO';
import type { EventBus } from '@application/ports/EventBus';
import type { Clock } from '@application/ports/Clock';
import type { OrderRepository } from '@application/ports/OrderRepository';
import type { PricingService } from '@application/ports/PricingService';
import { fail, ok, type Result } from '@shared/Result';
import { DomainError } from '@domain/errors/DomainError';
import { OrderId } from '@domain/value-objects/OrderId';
import { SKU } from '@domain/value-objects/SKU';
import { OrderItem } from '@domain/value-objects/OrderItem';
import type { Order } from '@domain/entities/Order';
import type { AppError } from '@application/error';

type Dependencies = {
    readonly repository: OrderRepository;
    readonly pricing: PricingService;
    readonly eventBus: EventBus;
    readonly clock: Clock;
};

export class AddItemToOrderUseCase {
    constructor(private readonly deps: Dependencies) {}

    async execute(input: AddItemToOrderDTO): Promise<Result<Order, AppError>> {
        try {
            const orderId = new OrderId(input.orderId);
            const order = await this.deps.repository.findById(orderId);
            if (!order) {
                return fail(notFoundError('orden', input.orderId));
            }

            const currency = order.total().currency;
            const sku = new SKU(input.sku);
            const unitPrice = await this.deps.pricing.getUnitPrice(sku, currency);
            const orderItem = OrderItem.of(sku, unitPrice, input.quantity);

            order.addItem(orderItem);

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

