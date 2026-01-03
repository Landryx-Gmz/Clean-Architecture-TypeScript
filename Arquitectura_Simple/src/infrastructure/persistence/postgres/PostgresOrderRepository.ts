import { Client, type PoolClient } from 'pg';
import { createHash } from 'crypto';
import type { OrderRepository } from '../../../application/ports/OrderRepository';
import { Order } from '../../../domain/entities/Order';
import { OrderItem } from '../../../domain/value-objects/OrderItem';
import type { Result } from '../../../shared/Result';
import { ok, fail } from '../../../shared/Result';
import { notFoundError, infraError } from '../../../application/error';
import type { AppError } from '../../../application/error';

export class PostgresOrderRepository implements OrderRepository {
    constructor(private readonly client: Client | PoolClient) { }

    async save(order: Order): Promise<Result<void, AppError>> {
        const connection = await this.getConnection();

        try {
            // Calcula el total_amount dinámicamente
            const items = order.getItems();
            const totalAmount = items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);

            // Upsert de la orden
            await this.upsertOrder(connection, order, totalAmount);

            // Reemplaza los items de la orden
            await this.replaceOrderItems(connection, order);

            return ok(undefined);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            return fail(infraError(`Failed to save order: ${errorMessage}`));
        }
    }

    async findById(orderId: string): Promise<Result<Order, AppError>> {
        try {
            const orderQuery = 'SELECT * FROM orders WHERE id = $1';
            const orderResult = await this.client.query(orderQuery, [orderId]);

            if (orderResult.rows.length === 0) {
                return fail(notFoundError('Order', orderId));
            }

            const orderRow = orderResult.rows[0];

            const itemsQuery = 'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC';
            const itemsResult = await this.client.query(itemsQuery, [orderId]);

            // Reconstruct order with items
            // This is a simplified reconstruction - you may need to adapt based on your Order class factory methods
            const order = Order.create(
                { value: orderRow.id } as any,
                orderRow.currency
            );

            return ok(order);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
            return fail(infraError(`Failed to find order: ${errorMessage}`));
        }
    }

    private async getConnection(): Promise<PoolClient | Client> {
        return this.client;
    }

    private async upsertOrder(
        connection: PoolClient | Client,
        order: Order,
        totalAmount: number
    ): Promise<void> {
        const upsertQuery = `
        INSERT INTO orders (id, currency, total_amount, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
        total_amount = EXCLUDED.total_amount,
        currency = EXCLUDED.currency,
        updated_at = NOW();
    `;

        await connection.query(upsertQuery, [
            order.id.value,
            'USD', // Default currency - adjust as needed
            totalAmount,
        ]);
    }

    private async replaceOrderItems(
        connection: PoolClient | Client,
        order: Order
    ): Promise<void> {
        const deleteQuery = 'DELETE FROM order_items WHERE order_id = $1';
        await connection.query(deleteQuery, [order.id.value]);

        const insertQuery = `
            INSERT INTO order_items (id, order_id, sku, quantity, unit_price)
            VALUES ($1, $2, $3, $4, $5);
    `;

        const items = order.getItems();
        for (const item of items) {
            const itemId = createHash('md5').update(`${order.id.value}-${item.sku.value}`).digest('hex');
            await connection.query(insertQuery, [
                itemId,
                order.id.value,
                item.sku.value,
                item.quantity,
                item.unitPrice.amount,
            ]);
        }
    }
}