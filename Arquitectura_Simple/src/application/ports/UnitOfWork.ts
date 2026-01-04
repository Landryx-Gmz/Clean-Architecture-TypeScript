import type { OrderRepository } from '@application/ports/OrderRepository';
import { type Result } from '@shared/Result';
import { type AppError } from '@application/error';


/**
 * Repositorios disponibles dentro de una transacción
 */
export interface UnitOfWorkRepositories {
    readonly orders: OrderRepository;
}

/**
 * Puerto que define el contrato para el patrón Unit of Work
 * 
 * El Unit of Work gestiona transacciones y expone repositorios
 * que utilizan la misma conexión dentro de la transacción.
 * 
 * Implementaciones:
 * - PgUnitOfWork: Para PostgreSQL con transacciones ACID
 * - InMemoryUnitOfWork: Para testing (opcional)
 */
export interface UnitOfWork {
    /**
     * Ejecuta una función dentro de una transacción
     * 
     * Si la función se ejecuta correctamente, se hace COMMIT.
     * Si lanza una excepción, se hace ROLLBACK automáticamente.
     * Devuelve un Result que encapsula el éxito o el error.
     * 
     * @param callback Función que recibe los repositorios disponibles
     * @returns Un Result con el valor devuelto por la función callback o un AppError
     * 
     * @example
     * ```typescript
     * const result = await uow.run(async (repos) => {
     *   const order = Order.create(new OrderId('123'), 'USD');
     *   order.addItem(...);
     *   
     *   const saveResult = await repos.orders.save(order);
     *   if (!isSuccess(saveResult)) {
     *     throw new Error('Failed to save');
     *   }
     *   
     *   return order;
     * });
     * // Si todo va bien → COMMIT
     * // Si hay error → ROLLBACK
     * ```
     */
    run<T>(callback: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<Result<T, AppError>>;
}
