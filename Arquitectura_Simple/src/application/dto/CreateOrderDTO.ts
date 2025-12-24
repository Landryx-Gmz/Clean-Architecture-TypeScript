import type { Currency } from '@domain/value-objects/Currency';

export interface CreateOrderItemDTO {
    sku: string;
    quantity: number;
}

export interface CreateOrderDTO {
    orderId: string;
    currency: Currency;
    items?: CreateOrderItemDTO[];
}

