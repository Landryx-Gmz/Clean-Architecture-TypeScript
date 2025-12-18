// TODO: Event Publisher (Bus)
// Responsable de distribuir eventos a los listeners interesados
// Implementación simple (en memoria); en producción usar RabbitMQ, Kafka, etc.

import type { DomainEvent } from "./DomainEvent.js";

export type EventHandler<T extends DomainEvent> = (event: T) => Promise<void> | void;

export class EventPublisher {
    private listeners: Map<string, EventHandler<any>[]> = new Map();

    // Suscribirse a un evento específico
    subscribe<T extends DomainEvent>(
        eventType: string,
        handler: EventHandler<T>
    ): void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType)!.push(handler);
    }

    // Publicar un evento (todos los listeners registrados serán ejecutados)
    async publish(event: DomainEvent): Promise<void> {
        const eventType = event.getEventType();
        const handlers = this.listeners.get(eventType) || [];

        // Ejecutar todos los handlers en paralelo
        await Promise.all(handlers.map((handler) => handler(event)));
    }
}

// Singleton global (en un proyecto real usar inyección de dependencias)
export const eventPublisher = new EventPublisher();
