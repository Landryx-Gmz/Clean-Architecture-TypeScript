import { InvalidIdError } from '@domain/errors/InvalidIdError';

export class OrderId {
    readonly value: string;

    constructor(value: string) {
        const normalized = value?.trim();
        if (!normalized || normalized.length < 3) {
            throw new InvalidIdError(value, 'orden');
        }
        this.value = normalized;
    }
}


