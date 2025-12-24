import { InvalidIdError } from '@domain/errors/InvalidIdError';

export class ProductId {
    readonly value: string;

    constructor(value: string) {
        const normalized = value?.trim();
        if (!normalized || normalized.length < 3) {
            throw new InvalidIdError(value, 'producto');
        }
        this.value = normalized;
    }
}


