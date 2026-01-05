export abstract class AppErrorBase extends Error {
    abstract readonly type: 'validation' | 'not_found' | 'conflict' | 'infra';

    protected constructor(message: string, readonly cause?: unknown) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ValidationError extends AppErrorBase {
    readonly type = 'validation' as const;

    constructor(message: string, readonly details?: Record<string, string>, cause?: unknown) {
        super(message, cause);
    }
}

export class NotFoundError extends AppErrorBase {
    readonly type = 'not_found' as const;

    constructor(readonly resource: string, readonly id?: string) {
        super(id ? `${resource} "${id}" no encontrado` : `${resource} no encontrado`);
    }
}

export class ConflictError extends AppErrorBase {
    readonly type = 'conflict' as const;

    constructor(message: string, readonly resource?: string, readonly id?: string) {
        super(message);
    }
}

export class InfraError extends AppErrorBase {
    readonly type = 'infra' as const;

    constructor(message: string, cause?: unknown) {
        super(message, cause);
    }

    /**
     * Crea un InfraError genérico para errores inesperados.
     */
    static unexpected(cause: unknown, message = 'Error inesperado de infraestructura'): InfraError {
        if (cause instanceof Error && cause.message) {
            return new InfraError(cause.message, cause);
        }
        return new InfraError(message, cause);
    }
}

export type AppError = ValidationError | NotFoundError | ConflictError | InfraError;

export const validationError = (
    message: string,
    details?: Record<string, string>,
    cause?: unknown,
): ValidationError => new ValidationError(message, details, cause);

export const notFoundError = (resource: string, id?: string): NotFoundError => new NotFoundError(resource, id);

export const conflictError = (message: string, resource?: string, id?: string): ConflictError =>
    new ConflictError(message, resource, id);

export const infraError = (message: string, cause?: unknown): InfraError => new InfraError(message, cause);

