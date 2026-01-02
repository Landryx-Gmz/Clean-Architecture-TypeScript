# PARTE 1 — Construcción guiada con IA

Este documento resume, paso a paso, cómo se construyó el microservicio de pedidos siguiendo Clean Architecture, apoyándonos en IA para decisiones y redacción de código.

## 1) Objetivo del ejercicio
- Crear un microservicio minimal de órdenes con casos de uso de creación y agregado de ítems.
- Aplicar Clean Architecture: dominio (entidades/VO/eventos), aplicación (use cases/puertos), infraestructura (adaptadores HTTP, pricing, repo, event bus), composición (DI root).
- Mantenerlo 100% in-memory para foco en dominio y patrones.

## 2) Estructura de carpetas clave
- Dominio: [src/domain](src/domain) con `Order` y VO (`Money`, `SKU`, `OrderItem`, `OrderId`) y eventos (`OrderCreated`, `ItemAddedToOrder`, `OrderTotalRecalculated`).
- Aplicación: [src/application](src/application) con use cases `CreateOrderUseCase`, `AddItemToOrderUseCase`, puertos (repo, pricing, event bus, clock) y errores `AppError`.
- Infraestructura: [src/infrastructure](src/infrastructure)
  - HTTP Fastify: [src/infrastructure/http/server.ts](src/infrastructure/http/server.ts), [src/infrastructure/http/controllers/OrdersController.ts](src/infrastructure/http/controllers/OrdersController.ts)
  - Pricing estático: [src/infrastructure/http/StaticPricingService.ts](src/infrastructure/http/StaticPricingService.ts)
  - Repo en memoria: [src/infrastructure/persistence/in-memory/InMemoryOrderRepository.ts](src/infrastructure/persistence/in-memory/InMemoryOrderRepository.ts)
  - Event bus no-op: [src/infrastructure/messaging/NoopEventBus.ts](src/infrastructure/messaging/NoopEventBus.ts)
- Composición: [src/composition/container.ts](src/composition/container.ts) crea instancias de adaptadores y use cases.
- Entrada: [src/main.ts](src/main.ts) arranca Fastify con DI.
- Pruebas: dominio en [tests/domain](tests/domain), aceptación en [tests/acceptance](tests/acceptance).

## 3) Flujo de dependencias (alta cohesión, bajo acoplamiento)
- Controlador HTTP → casos de uso (`CreateOrderUseCase`, `AddItemToOrderUseCase`).
- Casos de uso → puertos (`OrderRepository`, `PricingService`, `EventBus`, `Clock`).
- Dominio no conoce infraestructura; sólo usa VO/entidades/eventos.
- Composición inyecta adaptadores concretos en el contenedor; `main` arma server + deps.

## 4) Decisiones guiadas por IA
- Diseño de VO (`Money` con redondeo a 2 decimales, validaciones y chequeo de moneda) y reglas de `Order` (merge por SKU/currency, eventos emitidos tras mutaciones).
- Mapeo de errores de dominio a `AppError` y a HTTP en `OrdersController`.
- Uso de adaptadores en memoria para foco en dominio y tests rápidos.
- Alias TS configurados en `tsconfig` y `vitest.config` para imports cortos.

## 5) Paso a paso resumido
1. Definir modelo dominio: VO (`Currency`, `Money`, `SKU`, `OrderItem`, `OrderId`), entidad `Order`, eventos de dominio, errores específicos.
2. Crear puertos aplicación (`OrderRepository`, `PricingService`, `EventBus`, `Clock`) y DTOs.
3. Implementar casos de uso `CreateOrderUseCase` y `AddItemToOrderUseCase` con `Result` y mapping de errores a `AppError`.
4. Construir adaptadores in-memory: repo, pricing estático, event bus no-op.
5. Exponer HTTP con Fastify: rutas `/orders` y `/orders/:orderId/items`, health `/check`.
6. Componer dependencias en [src/composition/container.ts](src/composition/container.ts) y bootstrap en [src/main.ts](src/main.ts) (HOST/PORT env).
7. Añadir pruebas con Vitest: dominio (VO/aggregate) y aceptación (use case + adaptadores).

## 6) Cómo corre y se prueba
- Dev: `npm run dev` (usa `tsx src/main.ts`).
- Build: `npm run build` (salida a `dist`).
- Start: `npm start` (ejecuta `dist/src/main.js`).
- Tests: `npm test` o `npm run test:watch` (Vitest busca en `tests/**`).

## 7) Endpoints para probar
- Health: `GET /check`.
- Crear orden: `POST /orders` (body: `orderId`, `currency`, `items[]`).
- Agregar ítem: `POST /orders/:orderId/items` (body: `sku`, `quantity`).

## 8) Cómo la IA ayudó
- Propuso estructura de capas y contratos de puertos.
- Generó VO y reglas de negocio con validaciones claras.
- Redactó casos de uso con manejo de errores consistente.
- Sugirió adaptadores in-memory y servidor Fastify mínimo.
- Escribió y reorganizó baterías de tests (dominio y aceptación).

## 9) Próximos pasos sugeridos
- Añadir GET de lectura (`/orders/:id` y listado) con puerto repo extendido.
- Cambiar pricing/event bus a servicios reales según necesidad.
- Añadir persistencia real (DB) respetando los puertos.
