## Microservicio de Pedidos

Implementacion sencilla de Clean Architecture en TypeScript para gestionar pedidos: crear pedidos y agregar lineas con precios actuales.

### Capas (breve)
- Dominio: entidades (`Order`), value objects (`Money`, `SKU`, `Quantity`), eventos de dominio.
- Aplicacion: casos de uso (`create-order`, `add-item-to-order`), puertos (repositorio, pricing, bus de eventos), DTOs.
- Infraestructura: repositorios (in-memory y postgres), pricing estatico, event bus no-op/outbox, HTTP con Fastify.
- Composicion: containers que ensamblan dependencias.

### Endpoints principales
- `POST /orders` crea un pedido y devuelve el total inicial.
- `POST /orders/:orderId/items` agrega una linea (SKU + cantidad) y recalcula el total.

### Estructura de carpetas
- `src/domain`: entidades, value objects, eventos.
- `src/application`: casos de uso, puertos, DTOs, errores.
- `src/infrastructure`: HTTP, logging, messaging, persistence (in-memory y postgres).
- `src/composition`: configuracion y containers.
- `src/shared`: helpers como `Result`.
- `scripts`: migraciones y utilidades CLI.
- `tests`: pruebas unitarias, de aceptacion e integracion.

### Requisitos
- Node 20+
- Docker (solo si usas Postgres con docker-compose)

### Instalacion
```bash
npm install
```

### Ejecutar la API (modo dev)
```bash
npm run dev
# levanta Fastify en el puerto definido en config (ver src/infrastructure/http/server.ts)
```

### Ejecutar pruebas
```bash
npm test
```

### Migraciones (Postgres)
```bash
npm run migrate
```

### Notas de configuracion
- El proyecto usa `moduleResolution: NodeNext`; las importaciones relativas en tests incluyen la extension `.js`.
- Aliases definidos en `tsconfig.json` y `vitest.config.ts` (`@domain`, `@application`, etc.).

## Orden de ejecución
-Docker_desktop abierto
-npm run db:up
-npm run dev
-npm run worker:outbox

## Consultas Docker_desktop en terminal de la BD

-psql -U postgres -d orders

Para ver que tablas tenemos ejecutamos:

\dt

Para ver la tabla orders ejecutamos 

\d orders

Para hacer consultas:

consultar orders:
SELECT * FROM orders; 

consultar items:
SELECT * FROM order_items; 

Consultar eventos en la tabla oubox ordenado de manera descendiente:
SELECT * FROM outbox ORDER BY created_at DESC; 
q para salir

Para salir de psql:
/q