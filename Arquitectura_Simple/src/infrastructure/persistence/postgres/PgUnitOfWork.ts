import { Client, type PoolClient } from 'pg';
import type { OrderRepository } from '../../../application/ports/OrderRepository';
import { PostgresOrderRepository } from './PostgresOrderRepository';

/**
 * Repositorios disponibles dentro de una transacción
 */
export interface UnitOfWorkRepositories {
    readonly orders: OrderRepository;
}

/**
 * Unit of Work para PostgreSQL
 * 
 * Gestiona transacciones (BEGIN/COMMIT/ROLLBACK) y expone repositorios
 * que utilizan la misma conexión dentro de la transacción.
 * 
 * Ejemplo de uso:
 * ```typescript
 * const uow = new PgUnitOfWork(pool);
 * 
 * await uow.run(async (repos) => {
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
export class PgUnitOfWork {
    constructor(private readonly pool: Client | PoolClient) { }

    /**
     * Ejecuta una función dentro de una transacción
     * 
     * @param callback Función que recibe los repositorios disponibles
     * @returns El resultado devuelto por la función callback
     * 
     * @example
     * const result = await uow.run(async (repos) => {
     *   const savedResult = await repos.orders.save(order);
     *   return savedResult;
     * });
     */
    async run<T>(
        callback: (repos: UnitOfWorkRepositories) => Promise<T>
    ): Promise<T> {
        // Obtener una conexión del pool (o usar el cliente actual)
        const client = this.pool instanceof Client
            ? this.pool
            : await (this.pool as any).connect();

        try {
            // Iniciar transacción
            await client.query('BEGIN');

            // Crear repositorios que usan esta conexión
            const repos: UnitOfWorkRepositories = {
                orders: new PostgresOrderRepository(client),
            };

            // Ejecutar la función con los repositorios
            const result = await callback(repos);

            // Si todo va bien, hacer COMMIT
            await client.query('COMMIT');

            return result;
        } catch (error) {
            // Si hay error, hacer ROLLBACK
            try {
                await client.query('ROLLBACK');
            } catch (rollbackError) {
                console.error('Error during ROLLBACK:', rollbackError);
            }

            // Re-lanzar el error original
            throw error;
        } finally {
            // Liberar la conexión si fue obtenida del pool
            if (this.pool !== client && 'release' in client) {
                (client as any).release();
            }
        }
    }
}
