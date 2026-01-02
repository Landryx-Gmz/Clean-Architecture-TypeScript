import { CreateOrderUseCase } from '@application/use-case/CreateOrder';
import { AddItemToOrderUseCase } from '@application/use-case/AddItemToOrder';

export interface ServerDependencies {
    readonly createOrderUseCase: CreateOrderUseCase;
    readonly addItemToOrderUseCase: AddItemToOrderUseCase;
}

export { CreateOrderUseCase, AddItemToOrderUseCase };
