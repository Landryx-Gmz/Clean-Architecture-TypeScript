import { InvalidIdError } from '@domain/errors/InvalidIdError';

/**
 * Value Object para SKU (identificador de inventario).
 * Normaliza a mayúsculas para evitar duplicados por casing.
 */
export class SKU {
    readonly value: string;

    constructor(value: string) {
        const normalized = value?.trim();
        if (!normalized || normalized.length < 3) {
            throw new InvalidIdError(value, 'sku');
        }
        this.value = normalized.toUpperCase();
    }

    equals(other: SKU): boolean {
        return this.value === other.value;
    }
}

