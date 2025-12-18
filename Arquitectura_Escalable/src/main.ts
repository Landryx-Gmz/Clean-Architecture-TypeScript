// Composition root (bootstrap)
// TODO: Este archivo demuestra dónde inyectar adaptadores concretos en los use-cases.

import { InMemoryOrderRepository } from "./infrastructure/adapters/InMemoryOrderRepository.js";
import { PostgresOrderRepository } from "./infrastructure/adapters/PostgresOrderRepository.js";
import { CreateOrder } from "./application/use-cases/CreateOrder.js";
import { AddItemToOrder } from "./application/use-cases/AddItemToOrder.js";
import { OrdersController } from "./infrastructure/http/OrdersController.js";
import { Price } from "./domain/value-objects/Price.js";
import { fileURLToPath } from 'node:url';

// Selección simple de adaptador: cambiar aquí para usar Postgres en vez de InMemory
const repo = new InMemoryOrderRepository();
// const repo = new PostgresOrderRepository(); // alternativa real

const createOrder = new CreateOrder(repo);
const addItemToOrder = new AddItemToOrder(repo);

const ordersController = new OrdersController(createOrder, addItemToOrder);

// Ejemplo mínimo de uso (puede ejecutarse desde un script o pruebas)
async function exampleRun() {
    const created = await createOrder.execute({ id: "order-1" });
    console.log("Created order:", created.id, "total=", created.calculateTotal());

    // Añadir item (simulación):
    await addItemToOrder.execute({ orderId: "order-1", sku: "SKU-1", quantity: 2 }, new Price(10));
    const after = await repo.findById("order-1");
    console.log("After add item, total=", after?.calculateTotal());
}

// Exportar para tests o scripts
export { repo, createOrder, addItemToOrder, ordersController, exampleRun };

// Ejecutar si se invoca directamente (ESM-safe)
const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] === thisFile) {
    exampleRun().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
