# Informe de Arquitectura (Clean Architecture en TypeScript)

## 1. Vision general
- Objetivo: microservicio de pedidos que permite crear un pedido y agregar items con precios actuales.
- Estilo: Clean Architecture (dominio puro, casos de uso independientes, infraestructura reemplazable).
- Stack: Node 20+, TypeScript (moduleResolution: NodeNext), Fastify para HTTP, Vitest para pruebas, Postgres opcional.

## 2. Mapa de carpetas y relaciones
- src/domain: modelo del dominio y reglas de negocio.
  - entities/Order.ts: agrega y valida lineas, dispara eventos de dominio.
  - value-objects/: Money, Currency, SKU, Quantity encapsulan invariantes.
  - events/: OrderCreated, ItemAddedToOrder heredan de DomainEvent.
- src/application: casos de uso y puertos (interfaces) hacia el mundo exterior.
  - use-cases/: create-order, add-item-to-order, create-order-with-uow.
  - ports/: OrderRepository, PricingService, EventBus, UnitOfWork, Logger definen contratos.
  - dto/: datos de entrada/salida para los casos de uso.
- src/infrastructure: implementaciones concretas de los puertos.
  - persistence/: repos in-memory y Postgres; PgUnitOfWork para transacciones.
  - http/: server Fastify, controladores y servicios de pricing estatico.
  - messaging/: NoopEventBus, OutboxEventBus, OutboxDispatcher.
  - logging/: PinoLogger.
- src/composition: containers que ensamblan dependencias (composition root).
- src/shared: utilidades como Result (modelo Ok/Error).
- scripts/: migraciones (db/migrations) y utilidades CLI (migrate.ts).
- tests/: unitarias (dominio), integracion (infra), aceptacion (casos de uso end-to-end ligero).

Relaciones clave:
- Los casos de uso (application) dependen de puertos. No conocen implementaciones.
- Infraestructura implementa los puertos y es inyectada via containers.
- Domio no depende de application ni infraestructura; solo tipos propios.
- Composition arma el grafo de dependencias y lo expone a HTTP o a tests.

## 3. Flujo resumido de un caso de uso
- Crear pedido (`create-order`):
  1) Recibe DTO (customerId, currency). 2) Crea `Order` (dominio). 3) Persiste via `OrderRepository`. 4) Publica `OrderCreated` via `EventBus`. 5) Devuelve `Result` con el ID y total.
- Agregar item (`add-item-to-order`):
  1) Recibe orderId, SKU, cantidad. 2) Busca Order via repo. 3) Consulta precio actual en `PricingService`. 4) Order agrega item (valida cantidad y SKU). 5) Repo guarda; `EventBus` publica `ItemAddedToOrder`. 6) Retorna `Result` con total actualizado.

## 4. Infraestructura y configuracion
- HTTP: Fastify monta rutas en infrastructure/http/server.ts; controllers delegan en casos de uso.
- Persistencia: InMemory para desarrollo/pruebas rapidas; Postgres (PgUnitOfWork + repos) para persistencia real.
- Mensajeria: NoopEventBus para desarrollo; OutboxEventBus + OutboxDispatcher para integraciones confiables.
- Logging: PinoLogger envuelve pino y permite child loggers con contexto.
- Config: containers en src/composition deciden que implementaciones usar (in-memory, postgres, etc.).
- Module resolution: NodeNext obliga a usar extensiones .js en imports relativos dentro de tests.
- Aliases: definidos en tsconfig.json y vitest.config.ts (ej. @domain/*, @application/*).

## 5. Estrategia de pruebas
- Unitarias (tests/domain, tests/shared): validan invariantes de value objects y entidades.
- Aceptacion (tests/acceptance): ejecutan casos de uso completos con infra ligera (in-memory, pricing estatico, NoopEventBus).
- Integracion (tests/integration): prueban adapters concretos (PgUnitOfWork, repos Postgres).
- Infra (tests/infrastructure): prueban piezas como OutboxEventBus y PinoLogger.

## 6. Como se construyo el proyecto (paso a paso)
1) Inicializacion: `npm init -y` y configuracion TypeScript con `moduleResolution: NodeNext`, `strict: true`, `baseUrl` y `paths` para aliases.
2) Carpeta dominio: crear entidades, value objects y eventos sin dependencias externas.
3) Carpeta application: definir puertos (interfaces) y DTOs; implementar casos de uso que dependen solo de puertos.
4) Carpeta infrastructure: crear adapters que implementan los puertos (repos in-memory/Postgres, pricing, event bus, logging, HTTP Fastify).
5) Composition root: containers que resuelven dependencias y exponen instancias listas para usar (HTTP, tests, CLI).
6) Tests: configurar Vitest con aliases; crear suites unitarias, de aceptacion e integracion; usar infra in-memory para velocidad.
7) Base de datos: agregar migraciones en db/migrations y script `npm run migrate` (scripts/migrate.ts) cuando se usa Postgres.
8) Ajustes NodeNext: agregar extensiones `.js` en imports relativos en tests y mantener mayusculas/minusculas consistentes en rutas.

## 7. Como ejecutar
- Instalar dependencias: `npm install`
- Modo desarrollo HTTP: `npm run dev`
- Pruebas: `npm test`
- Migraciones Postgres: `npm run migrate` (requiere docker-compose o instancia Postgres disponible)

## 8. Puntos clave para quien empieza en Clean Architecture
- Separa el "que hace" (dominio + casos de uso) del "como se conecta" (infraestructura).
- Habla con el dominio a traves de interfaces (puertos); las implementaciones pueden cambiar sin tocar el dominio.
- Usa contenedores/composition root para armar dependencias y mantener el dominio libre de frameworks.
- Las pruebas de aceptacion usan adapters simples (in-memory) para ser rapidas y predecibles; las de integracion prueban adapters reales.
