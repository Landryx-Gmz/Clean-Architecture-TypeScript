export type Result<T, E> = Success<T> | Failure<E>;

export interface Success<T> {
    readonly kind: 'success';
    readonly value: T;
}

export interface Failure<E> {
    readonly kind: 'failure';
    readonly error: E;
}

export const ok = <T>(value: T): Result<T, never> => ({
    kind: 'success',
    value,
});

export const fail = <E>(error: E): Result<never, E> => ({
    kind: 'failure',
    error,
});

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
    result.kind === 'success';

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
    result.kind === 'failure';

export const match = <T, E, R>(
    result: Result<T, E>,
    onSuccess: (value: T) => R,
    onFailure: (error: E) => R,
): R => {
    if (isSuccess(result)) {
        return onSuccess(result.value);
    }
    return onFailure(result.error);
};
