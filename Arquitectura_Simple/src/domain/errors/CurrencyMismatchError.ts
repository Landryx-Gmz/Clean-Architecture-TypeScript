import { DomainError } from '@domain/errors/DomainError';

export class CurrencyMismatchError extends DomainError {
    constructor(expected: string, got: string) {
        super(`Moneda incompatible. Esperada: ${expected}. Recibida: ${got}`);
    }
}


