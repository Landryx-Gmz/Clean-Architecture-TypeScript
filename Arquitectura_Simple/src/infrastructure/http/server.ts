import Fastify, { FastifyInstance } from 'fastify';
import { OrdersController } from './controllers/OrdersController';
import type { ServerDependencies } from '../dependencies';

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
        dependencies.createOrder,
        dependencies.addItemToOrder,
    );

    ordersController.registerRoutes(server);

    return server;
};