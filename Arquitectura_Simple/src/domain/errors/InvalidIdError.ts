import { DomainError } from '@domain/errors/DomainError';

export class InvalidIdError extends DomainError {
    constructor(id: string, label: string) {
        super(`Identificador invalido para ${label}: "${id}"`);
    }
}


