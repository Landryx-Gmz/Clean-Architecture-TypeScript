# Eventos de Dominio (Domain Events)

## 📌 ¿Qué son los Eventos de Dominio?

Los **eventos de dominio** son hechos o cambios importantes que ocurren en el negocio y que deben ser comunicados dentro del sistema. Representan algo que sucedió en el pasado y que otros componentes pueden querer escuchar y reaccionar ante.

### Ejemplo de la vida real:
- **Evento**: "Se creó una orden"
- **Quién lo publica**: El dominio (use-case CreateOrder)
- **Quién lo escucha**: 
  - Sistema de emails (enviar confirmación)
  - Analytics (registrar creación)
  - Sistema de inventario (reservar stock)
  - Notificaciones (alertar al usuario)

---

## 🏗️ Estructura de Eventos de Dominio

### 1. **DomainEvent (Base Class)**
```typescript
export abstract class DomainEvent {
  readonly occurredAt: Date;  // Cuándo sucedió
  readonly eventId: string;   // ID único del evento

  abstract getEventType(): string;
}
```

### 2. **Eventos Específicos (heredan de DomainEvent)**
```typescript
export class OrderCreated extends DomainEvent {
  constructor(readonly orderId: string) {
    super();
  }

  getEventType(): string {
    return "OrderCreated";
  }
}
```

### 3. **Event Publisher (Bus de Eventos)**
```typescript
export class EventPublisher {
  subscribe(eventType: string, handler: EventHandler): void;
  async publish(event: DomainEvent): Promise<void>;
}
```

### 4. **Event Listeners (Handlers)**
```typescript
export class SendOrderConfirmationEmailListener {
  async handle(event: OrderCreated): Promise<void> {
    // Reacciona al evento OrderCreated
  }
}
```

---

## 📂 Archivos Creados

```
src/domain/events/
├── DomainEvent.ts                    # Clase base para todos los eventos
├── OrderCreated.ts                   # Evento: se creó una orden
├── ItemAddedToOrder.ts               # Evento: se añadió item a orden
├── EventPublisher.ts                 # Bus de eventos (publicador/suscriptor)
└── OrderCreatedListeners.ts          # Listeners que reaccionan a OrderCreated
```

---

## 🔄 Cómo Funcionan los Eventos

### **Paso 1: Crear el Evento**
```typescript
const event = new OrderCreated("order-123");
```

### **Paso 2: Suscribirse al Evento (en main.ts o bootstrap)**
```typescript
const emailListener = new SendOrderConfirmationEmailListener();
const analyticsListener = new UpdateOrderAnalyticsListener();

eventPublisher.subscribe("OrderCreated", (event) =>
  emailListener.handle(event)
);
eventPublisher.subscribe("OrderCreated", (event) =>
  analyticsListener.handle(event)
);
```

### **Paso 3: Publicar el Evento (desde use-case)**
```typescript
export class CreateOrder {
  async execute(dto: CreateOrderDTO): Promise<Order> {
    const order = new Order(dto.id);
    await this.repo.save(order);

    // Publicar evento para que otros sistemas reaccionen
    await eventPublisher.publish(new OrderCreated(order.id));

    return order;
  }
}
```

### **Paso 4: Los Listeners Reaccionan**
```
OrderCreated event publicado
    ├─→ SendOrderConfirmationEmailListener.handle() → 📧 envía email
    ├─→ UpdateOrderAnalyticsListener.handle()        → 📊 actualiza stats
    └─→ [Otros listeners registrados]                → 🔔 otras reacciones
```

---

## 🎯 Ventajas de los Eventos de Dominio

| Ventaja | Descripción |
|---------|------------|
| **Desacoplamiento** | Los listeners no conocen el código que publica eventos |
| **Escalabilidad** | Añade nuevos listeners sin modificar el dominio |
| **Auditoría** | Registra todo lo que sucede en el negocio |
| **Reactividad** | Múltiples sistemas reaccionan al mismo evento |
| **Eventual Consistency** | Facilita patrones asincronos |

### Ejemplo: Añadir funcionalidad sin modificar dominio
```typescript
// Código existente NO cambia, solo añades un listener nuevo
export class NotifyInventorySystemListener {
  async handle(event: OrderCreated): Promise<void> {
    // Reservar stock automáticamente
  }
}

eventPublisher.subscribe("OrderCreated", (event) =>
  inventoryListener.handle(event)
);
```

---

## 🔌 Integración con Use-Cases

### Ejemplo: CreateOrder con eventos

**Antes (sin eventos)**:
```typescript
export class CreateOrder {
  async execute(dto: CreateOrderDTO): Promise<Order> {
    const order = new Order(dto.id);
    await this.repo.save(order);
    return order;
  }
}
```

**Después (con eventos)**:
```typescript
export class CreateOrder {
  constructor(
    private readonly repo: OrderRepository,
    private readonly eventPublisher: EventPublisher  // ✨ inyectado
  ) {}

  async execute(dto: CreateOrderDTO): Promise<Order> {
    const order = new Order(dto.id);
    await this.repo.save(order);

    // Publicar evento para que otros sistemas sepan que la orden fue creada
    await this.eventPublisher.publish(new OrderCreated(order.id));

    return order;
  }
}
```

### Ejemplo: AddItemToOrder con eventos

```typescript
export class AddItemToOrder {
  constructor(
    private readonly repo: OrderRepository,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(dto: AddItemDTO, price: Price) {
    const order = await this.repo.findById(dto.orderId);
    if (!order) throw new Error('Order not found');

    order.items.push({ sku: dto.sku, quantity: dto.quantity, price: price.amount });
    await this.repo.save(order);

    // Publicar evento para notificar que se añadió item
    await this.eventPublisher.publish(
      new ItemAddedToOrder(dto.orderId, dto.sku, dto.quantity, price.amount)
    );

    return order;
  }
}
```

---

## 📚 Casos de Uso de Eventos

### 1. **Notificaciones por Email**
```typescript
class SendOrderConfirmationEmailListener {
  async handle(event: OrderCreated): Promise<void> {
    // Enviar email a cliente
  }
}
```

### 2. **Analytics y Auditoría**
```typescript
class LogOrderEventListener {
  async handle(event: OrderCreated): Promise<void> {
    // Guardar en base de datos de auditoría
    await auditDb.save({
      eventType: event.getEventType(),
      orderId: event.orderId,
      timestamp: event.occurredAt
    });
  }
}
```

### 3. **Sincronización con Sistemas Externos**
```typescript
class SyncWithInventorySystemListener {
  async handle(event: ItemAddedToOrder): Promise<void> {
    // Llamar API del sistema de inventario para reservar stock
    await inventoryApi.reserveStock(event.sku, event.quantity);
  }
}
```

### 4. **Webhooks a Clientes**
```typescript
class SendWebhookToClientListener {
  async handle(event: OrderCreated): Promise<void> {
    // Notificar a cliente vía webhook
    await webhookService.send(client.webhookUrl, event);
  }
}
```

### 5. **Integración con Message Queues (RabbitMQ, Kafka)**
```typescript
class PublishToMessageQueueListener {
  async handle(event: OrderCreated): Promise<void> {
    // Publicar a RabbitMQ para procesamiento asincrónico
    await rabbitMQ.publish('orders.created', event);
  }
}
```

---

## 🧪 Testing Eventos de Dominio

```typescript
describe("OrderCreated Event", () => {
  it("should publish event when order is created", async () => {
    let eventPublished = false;
    let publishedEvent: OrderCreated | null = null;

    // Mock listener
    eventPublisher.subscribe("OrderCreated", (event: OrderCreated) => {
      eventPublished = true;
      publishedEvent = event;
    });

    const createOrder = new CreateOrder(repo, eventPublisher);
    await createOrder.execute({ id: "order-1" });

    expect(eventPublished).toBe(true);
    expect(publishedEvent?.orderId).toBe("order-1");
  });
});
```

---

## 🌳 Arquitectura con Eventos

```
┌─────────────────────────────────────────────────────┐
│                HTTP Request                          │
│                    ↓                                 │
│            OrdersController.create()                │
│                    ↓                                 │
│        CreateOrder.execute(dto)                     │
│            ┌──────────────────┐                     │
│            │   Order entity   │                     │
│            │ saved to DB      │                     │
│            └──────────────────┘                     │
│                    ↓                                 │
│    eventPublisher.publish(OrderCreated)             │
│                    ↓                                 │
│    ┌──────────────────────────────────┐            │
│    │  Múltiples Listeners Reaccionan  │            │
│    ├──────────────────────────────────┤            │
│    │ 1. SendEmailListener ──→ 📧      │            │
│    │ 2. AnalyticsListener ──→ 📊      │            │
│    │ 3. InventoryListener ──→ 📦      │            │
│    │ 4. WebhookListener ───→ 🔗       │            │
│    └──────────────────────────────────┘            │
│                    ↓                                 │
│            HTTP Response 200                        │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Próximos Pasos

1. **Implementar eventos en CreateOrder y AddItemToOrder**:
   - Inyectar `EventPublisher` en los use-cases
   - Publicar eventos después de persistir

2. **Crear listeners reales**:
   - Email (Sendgrid, Mailgun)
   - Analytics (Google Analytics, Mixpanel)
   - Auditoría (base de datos)

3. **Integrar con Message Queue**:
   - RabbitMQ o Kafka para procesamiento asincrónico
   - Event Sourcing para auditoría completa

4. **Testing**:
   - Tests que verifiquen que los eventos se publican
   - Tests que verifiquen que los listeners reaccionan correctamente

---

## 📖 Lectura Recomendada

- **Domain-Driven Design** (Eric Evans) - Capítulo sobre eventos de dominio
- **Patterns of Enterprise Application Architecture** (Martin Fowler) - Event Sourcing
- **Building Microservices** (Sam Newman) - Asynchronous Communication
