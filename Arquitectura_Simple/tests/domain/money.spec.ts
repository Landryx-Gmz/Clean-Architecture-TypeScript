import { describe, expect, it } from 'vitest';
import { Money } from '@domain/value-objects/Money';
import type { Currency } from '@domain/value-objects/Currency';
import { CurrencyMismatchError } from '@domain/errors/CurrencyMismatchError';
import { InvalidAmountError } from '@domain/errors/InvalidAmountError';

const USD: Currency = 'USD';
const EUR: Currency = 'EUR';

describe('Money value object', () => {
    it('creates zero and preserves currency', () => {
        // Zero factory keeps currency and amount 0
        const zero = Money.zero(USD);
        expect(zero.amount).toBe(0);
        expect(zero.currency).toBe(USD);
    });

    it('rounds to 2 decimals on creation', () => {
        // Constructor normalizes to two decimals
        const value = Money.of(10.129, USD);
        expect(value.amount).toBe(10.13);
    });

    it('throws on negative or non-finite amounts', () => {
        // Validation rejects negative, NaN, or infinite values
        expect(() => Money.of(-1, USD)).toThrow(InvalidAmountError);
        expect(() => Money.of(Number.NaN, USD)).toThrow(InvalidAmountError);
        expect(() => Money.of(Number.POSITIVE_INFINITY, USD)).toThrow(InvalidAmountError);
    });

    it('adds with same currency', () => {
        // add sums amounts when currencies match
        const a = Money.of(10, USD);
        const b = Money.of(5.55, USD);
        const sum = a.add(b);
        expect(sum.amount).toBe(15.55);
        expect(sum.currency).toBe(USD);
    });

    it('fails to add different currencies', () => {
        // add rejects different currencies via CurrencyMismatchError
        const a = Money.of(10, USD);
        const b = Money.of(5, EUR);
        expect(() => a.add(b)).toThrow(CurrencyMismatchError);
    });

    it('multiplies by a positive integer', () => {
        // multiply scales amount preserving currency
        const price = Money.of(9.99, USD);
        const subtotal = price.multiply(3);
        expect(subtotal.amount).toBe(29.97);
        expect(subtotal.currency).toBe(USD);
    });

    it('throws on non-positive multiplier', () => {
        // multiply rejects zero or negative quantities
        const price = Money.of(9.99, USD);
        expect(() => price.multiply(0)).toThrow(InvalidAmountError);
        expect(() => price.multiply(-2)).toThrow(InvalidAmountError);
    });
});
