import { DomainError } from '@domain/errors/DomainError';

export class InvalidQuantityError extends DomainError {
    constructor(quantity: number) {
        super(`Cantidad invalida: ${quantity}`);
    }
}


