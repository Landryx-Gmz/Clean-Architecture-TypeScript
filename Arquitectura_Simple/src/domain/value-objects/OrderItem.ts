import { InvalidQuantityError } from '@domain/errors/InvalidQuantityError';
import { Money } from '@domain/value-objects/Money';
import { SKU } from '@domain/value-objects/SKU';

/**
 * Value Object para representar un item de orden (sin identidad propia).
 */
export class OrderItem {
    readonly sku: SKU;
    readonly unitPrice: Money;
    readonly quantity: number;

    private constructor(sku: SKU, unitPrice: Money, quantity: number) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidQuantityError(quantity);
        }
        this.sku = sku;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    static of(sku: SKU, unitPrice: Money, quantity: number): OrderItem {
        return new OrderItem(sku, unitPrice, quantity);
    }

    subtotal(): Money {
        return this.unitPrice.multiply(this.quantity);
    }

    sameProduct(other: OrderItem): boolean {
        return (
            this.sku.equals(other.sku) &&
            this.unitPrice.currency === other.unitPrice.currency
        );
    }

    mergeQuantity(extra: number): OrderItem {
        return OrderItem.of(this.sku, this.unitPrice, this.quantity + extra);
    }
}


