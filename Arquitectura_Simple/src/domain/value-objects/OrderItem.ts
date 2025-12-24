import { InvalidQuantityError } from '@domain/errors/InvalidQuantityError';
import { Money } from '@domain/value-objects/Money';
import { ProductId } from '@domain/value-objects/ProductId';

/**
 * Value Object para representar un item de orden (sin identidad propia).
 */
export class OrderItem {
    readonly productId: ProductId;
    readonly unitPrice: Money;
    readonly quantity: number;

    private constructor(productId: ProductId, unitPrice: Money, quantity: number) {
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new InvalidQuantityError(quantity);
        }
        this.productId = productId;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    static of(productId: ProductId, unitPrice: Money, quantity: number): OrderItem {
        return new OrderItem(productId, unitPrice, quantity);
    }

    subtotal(): Money {
        return this.unitPrice.multiply(this.quantity);
    }

    sameProduct(other: OrderItem): boolean {
        return (
            this.productId.value === other.productId.value &&
            this.unitPrice.currency === other.unitPrice.currency
        );
    }

    mergeQuantity(extra: number): OrderItem {
        return OrderItem.of(this.productId, this.unitPrice, this.quantity + extra);
    }
}


