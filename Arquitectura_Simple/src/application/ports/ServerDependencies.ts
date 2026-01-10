import { CreateOrder } from '@application/use-cases/CreateOrder.js'
import { AddItemToOrder } from '@application/use-cases/AddItemToOrder.js'
import { Logger } from '@application/ports/Logger.js'

export interface ServerDependencies {
  createOrderUseCase: CreateOrder
  addItemToOrderUseCase: AddItemToOrder
  logger: Logger
}