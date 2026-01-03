import type { Order } from '@domain/entities/Order';
import type { OrderId } from '@domain/value-objects/OrderId';
import type { Result } from '@shared/Result';
import type { AppError } from '../error';

export interface OrderRepository {
    findById(id: OrderId | string): Promise<Result<Order, AppError>>;
    save(order: Order): Promise<Result<void, AppError>>;
    exists?(id: OrderId): Promise<boolean>;
}

