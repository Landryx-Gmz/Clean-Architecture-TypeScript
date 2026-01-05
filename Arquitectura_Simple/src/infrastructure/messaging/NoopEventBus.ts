import type { EventBus } from '@application/ports/EventBus';
import type { DomainEvent } from '@domain/events/DomainEvent';
import { ok, fail, type Result } from '@shared/Result';
import type { AppError } from '@application/error';
import { infraError } from '@application/error';

/**
 * Implementación en memoria del EventBus que no realiza ninguna operación.
 * Útil para tests y desarrollo cuando no se necesita realmente publicar eventos.
 */
export class NoopEventBus implements EventBus {
    /**
     * Publica eventos sin realizar ninguna operación.
     * Los eventos son validados y luego descartados.
     *
     * @param events - Array de eventos de dominio a publicar
     * @returns Promise que se resuelve cuando los eventos han sido procesados
     */
    async publish(events: DomainEvent[]): Promise<Result<void, AppError>> {
        const validationResult = this.validateEvents(events);

        if (validationResult.kind === 'failure') {
            return validationResult;
        }

        // No operation - los eventos son descartados después de la validación
        return ok(undefined);
    }

    /**
     * Valida que los eventos sean válidos antes de procesarlos.
     *
     * @param events - Array de eventos de dominio a validar
     * @returns Result indicando si la validación fue exitosa
     */
    private validateEvents(events: DomainEvent[]): Result<void, AppError> {
        if (!Array.isArray(events)) {
            return fail(infraError('Los eventos deben ser un array'));
        }

        for (const event of events) {
            if (!event) {
                return fail(infraError('Los eventos no pueden ser null o undefined'));
            }

            if (!event.type || typeof event.type !== 'string') {
                return fail(infraError('Cada evento debe tener un tipo válido'));
            }

            if (!(event.occurredAt instanceof Date)) {
                return fail(infraError('Cada evento debe tener una fecha de ocurrencia válida'));
            }
        }

        return ok(undefined);
    }
}

