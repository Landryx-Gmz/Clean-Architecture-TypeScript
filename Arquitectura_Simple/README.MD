# Microsercio de Pedidos

**Dominio**: Order, Price, SKU, Quantity, eventos de dominio.
**Application**: casos de uso CreateOrder, AddItemOrder, puertos y DTO.
**Infra**: repositorio InMemory, pricing estático, event bus no-op.
**HTTP**: endpoints mínimos con Fstify.
**Composición**: container.ts como composition root.
**Tests**: dominio + aceptación de caso de uso.


# Comportamiento
- `POST /orders` crea un pedido.
- `POST /orders/:orderId/items` agrega una línea (SKU + qty) con precio actual.
- Devulve el total del pedido.

# Estructura de carpetas

/scr
  /domain
    /entities
    /value-objects
    /events
    /errors
  /application
    /use-case
    /ports
    /dto
    /errors.ts
  /infrastructure
    /persitence/in-memory
    /http/controllers
    /http
    /messaging
  /composition
  /shared
/tests