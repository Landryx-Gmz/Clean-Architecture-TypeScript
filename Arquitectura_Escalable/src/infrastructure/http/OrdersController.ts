// TODO: Controller HTTP: OrdersController
// Controladores nombrados: Resource + action (OrdersController.create)

import { CreateOrder } from "../../application/use-cases/CreateOrder.js";
import { AddItemToOrder } from "../../application/use-cases/AddItemToOrder.js";
import type { CreateOrderDTO } from "../../application/dtos/CreateOrderDTO.js";

export class OrdersController {
    constructor(private createOrder: CreateOrder, private addItem: AddItemToOrder) { }

    // action: create
    async create(req: { body: any }) {
        const dto: CreateOrderDTO = { id: req.body.id };
        return this.createOrder.execute(dto);
    }
}
