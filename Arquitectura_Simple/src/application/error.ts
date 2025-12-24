export type ValidationError = {
    readonly type: 'validation';
    readonly message: string;
    readonly details?: Record<string, string> | undefined;
    readonly cause?: unknown;
};

export type NotFoundError = {
    readonly type: 'not_found';
    readonly message: string;
    readonly resource: string;
    readonly id?: string | undefined;
};

export type ConflictError = {
    readonly type: 'conflict';
    readonly message: string;
    readonly resource?: string | undefined;
    readonly id?: string | undefined;
};

export type InfraError = {
    readonly type: 'infra';
    readonly message: string;
    readonly cause?: unknown;
};

export type AppError = ValidationError | NotFoundError | ConflictError | InfraError;

export const validationError = (
    message: string,
    details?: Record<string, string>,
    cause?: unknown,
): ValidationError => ({
    type: 'validation',
    message,
    details,
    cause,
});

export const notFoundError = (resource: string, id?: string): NotFoundError => ({
    type: 'not_found',
    message: id ? `${resource} "${id}" no encontrado` : `${resource} no encontrado`,
    resource,
    id,
});

export const conflictError = (message: string, resource?: string, id?: string): ConflictError => ({
    type: 'conflict',
    message,
    resource,
    id,
});

export const infraError = (message: string, cause?: unknown): InfraError => ({
    type: 'infra',
    message,
    cause,
});

