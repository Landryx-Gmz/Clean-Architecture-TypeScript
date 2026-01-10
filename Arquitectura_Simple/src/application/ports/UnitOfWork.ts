import { Result } from '@shared/Result.js';
import { AppError } from '@application/errors.js';
import { OrderRepository } from '@application/ports/OrderRepository.js';

export interface UnitOfWork {
  run<T>(fn: (repos: Repositories) => Promise<T>): Promise<Result<T, AppError>>;
}

export interface Repositories {
  orderRepository: OrderRepository;
}
