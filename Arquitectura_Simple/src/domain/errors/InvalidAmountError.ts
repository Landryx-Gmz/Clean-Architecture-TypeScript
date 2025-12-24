import { DomainError } from '@domain/errors/DomainError';

export class InvalidAmountError extends DomainError {
    constructor(amount: number) {
        super(`Monto invalido: ${amount}`);
    }
}


