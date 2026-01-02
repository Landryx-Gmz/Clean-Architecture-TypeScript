import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { OrdersController } from './controllers/OrdersController';
import type { ServerDependencies } from '@application/ports/ServerDependencies';

export const buildServer = (dependencies: ServerDependencies): FastifyInstance => {
    const server = Fastify({
        logger: true,
    });

    // Check endpoint para comprobar el estado del servidor
    server.get('/check', async () => {
        return {
            status: 'ok',
            timestamp: new Date(),
        };
    });

    // Capa de presentación: Instanciamos y registramos los controladores
    const ordersController = new OrdersController(
        dependencies.createOrderUseCase,
        dependencies.addItemToOrderUseCase,
    );

    ordersController.registerRoutes(server);

    return server;
};