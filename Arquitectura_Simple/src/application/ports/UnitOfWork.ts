import type { Result } from '@shared/Result.js';
import { AppError } from '@application/error.js';
import { type OrderRepository } from '@application/ports/OrderRepository';

export interface UnitOfWork {
    run<T>(fn: (repos: Repositories) => Promise<T>): Promise<Result<T, AppError>>;
}

export interface Repositories {
    orderRepository: OrderRepository;
}
