import { CurrencyMismatchError } from '@domain/errors/CurrencyMismatchError';
import { InvalidAmountError } from '@domain/errors/InvalidAmountError';
import type { Currency } from '@domain/value-objects/Currency';

/**
 * Value Object para representar dinero con moneda inmutable.
 */
export class Money {
    readonly amount: number;
    readonly currency: Currency;

    private constructor(amount: number, currency: Currency) {
        if (!Number.isFinite(amount) || amount < 0) {
            throw new InvalidAmountError(amount);
        }
        // Normalizamos a 2 decimales sin perder la intención de validación previa.
        this.amount = Math.round(amount * 100) / 100;
        this.currency = currency;
    }

    static of(amount: number, currency: Currency): Money {
        return new Money(amount, currency);
    }

    static zero(currency: Currency): Money {
        return new Money(0, currency);
    }

    add(other: Money): Money {
        this.ensureSameCurrency(other);
        return new Money(this.amount + other.amount, this.currency);
    }

    multiply(quantity: number): Money {
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new InvalidAmountError(quantity);
        }
        return new Money(this.amount * quantity, this.currency);
    }

    private ensureSameCurrency(other: Money): void {
        if (this.currency !== other.currency) {
            throw new CurrencyMismatchError(this.currency, other.currency);
        }
    }
}


