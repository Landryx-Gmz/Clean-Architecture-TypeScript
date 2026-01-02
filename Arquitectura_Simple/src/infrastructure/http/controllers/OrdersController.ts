import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateOrderUseCase as CreateOrder } from '@application/use-case/CreateOrder';
import { AddItemToOrderUseCase as AddItemToOrder } from '@application/use-case/AddItemToOrder';
import type { CreateOrderDTO } from '@application/dto/CreateOrderDTO';
import type { AddItemToOrderDTO } from '@application/dto/AddItemToOrderDTO';
import type { AppError, ValidationError, NotFoundError, ConflictError, InfraError } from '@application/error';
import { infraError } from '@application/error';
import type { Order } from '@domain/entities/Order';
import { isFailure } from '@shared/Result';

/**
 * Controlador HTTP para manejar las peticiones relacionadas con órdenes.
 * Actúa como adaptador entre la capa HTTP (Fastify) y la capa de aplicación (casos de uso).
 */
export class OrdersController {
    constructor(
        private readonly CreateOrder: CreateOrder,
        private readonly AddItemToOrder: AddItemToOrder,
    ) { }

    /**
     * Registra las rutas del controlador en la instancia de Fastify.
     *
     * @param fastify - Instancia de Fastify
     */
    registerRoutes(fastify: FastifyInstance): void {
        // POST /orders - Crear una nueva orden
        fastify.post('/orders', this.handleCreateOrder.bind(this));

        // POST /orders/:orderId/items - Agregar un item a una orden existente
        fastify.post('/orders/:orderId/items', this.handleAddItemToOrder.bind(this));
    }

    /**
     * Maneja la creación de una nueva orden.
     * POST /orders
     */
    private async handleCreateOrder(
        request: FastifyRequest<{ Body: CreateOrderDTO }>,
        reply: FastifyReply,
    ): Promise<void> {
        try {
            const result = await this.CreateOrder.execute(request.body);

            if (isFailure(result)) {
                return this.handleError(reply, result.error);
            }

            const orderResponse = this.mapOrderToResponse(result.value);
            await reply.status(201).send(orderResponse);
        } catch (error) {
            const appError = infraError(
                error instanceof Error ? error.message : 'Error desconocido al crear la orden',
                error,
            );
            return this.handleError(reply, appError);
        }
    }

    /**
     * Maneja la adición de un item a una orden existente.
     * POST /orders/:orderId/items
     */
    private async handleAddItemToOrder(
        request: FastifyRequest<{ Params: { orderId: string }; Body: Omit<AddItemToOrderDTO, 'orderId'> }>,
        reply: FastifyReply,
    ): Promise<void> {
        try {
            const dto: AddItemToOrderDTO = {
                orderId: request.params.orderId,
                sku: request.body.sku,
                quantity: request.body.quantity,
            };

            const result = await this.AddItemToOrder.execute(dto);

            if (isFailure(result)) {
                return this.handleError(reply, result.error);
            }

            const orderResponse = this.mapOrderToResponse(result.value);
            await reply.status(200).send(orderResponse);
        } catch (error) {
            const appError = infraError(
                error instanceof Error ? error.message : 'Error desconocido al agregar item a la orden',
                error,
            );
            return this.handleError(reply, appError);
        }
    }

    /**
     * Maneja los errores de aplicación y los convierte a respuestas HTTP apropiadas.
     *
     * @param reply - Objeto de respuesta de Fastify
     * @param error - Error de aplicación
     */
    private async handleError(reply: FastifyReply, error: AppError): Promise<void> {
        switch (error.type) {
            case 'validation':
                return this.handleValidationError(reply, error);

            case 'not_found':
                return this.handleNotFoundError(reply, error);

            case 'conflict':
                return this.handleConflictError(reply, error);

            case 'infra':
                return this.handleInfraError(reply, error);

            default:
                await reply.status(500).send({
                    error: 'Error desconocido',
                    message: 'Ha ocurrido un error inesperado',
                });
        }
    }

    /**
     * Maneja errores de validación (400).
     */
    private async handleValidationError(reply: FastifyReply, error: ValidationError): Promise<void> {
        await reply.status(400).send({
            type: error.type,
            error: 'Error de validación',
            message: error.message,
            details: error.details,
        });
    }

    /**
     * Maneja errores de recurso no encontrado (404).
     */
    private async handleNotFoundError(reply: FastifyReply, error: NotFoundError): Promise<void> {
        await reply.status(404).send({
            type: error.type,
            error: 'Recurso no encontrado',
            message: error.message,
            resource: error.resource,
            id: error.id,
        });
    }

    /**
     * Maneja errores de conflicto (409).
     */
    private async handleConflictError(reply: FastifyReply, error: ConflictError): Promise<void> {
        await reply.status(409).send({
            type: error.type,
            error: 'Conflicto',
            message: error.message,
            resource: error.resource,
            id: error.id,
        });
    }

    /**
     * Maneja errores de infraestructura (500).
     */
    private async handleInfraError(reply: FastifyReply, error: InfraError): Promise<void> {
        await reply.status(500).send({
            type: error.type,
            error: 'Error de infraestructura',
            message: error.message,
        });
    }

    /**
     * Convierte una entidad Order a un objeto de respuesta JSON.
     *
     * @param order - Entidad Order del dominio
     * @returns Objeto de respuesta serializable
     */
    private mapOrderToResponse(order: Order): {
        id: string;
        currency: string;
        items: Array<{
            sku: string;
            unitPrice: { amount: number; currency: string };
            quantity: number;
            subtotal: { amount: number; currency: string };
        }>;
        total: { amount: number; currency: string };
    } {
        const total = order.total();
        const items = order.getItems();

        return {
            id: order.id.value,
            currency: total.currency,
            items: items.map((item) => ({
                sku: item.sku.value,
                unitPrice: {
                    amount: item.unitPrice.amount,
                    currency: item.unitPrice.currency,
                },
                quantity: item.quantity,
                subtotal: {
                    amount: item.subtotal().amount,
                    currency: item.subtotal().currency,
                },
            })),
            total: {
                amount: total.amount,
                currency: total.currency,
            },
        };
    }
}

