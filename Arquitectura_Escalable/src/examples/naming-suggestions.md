# Sugerencias de nombres (Ubiquitous Language)

Domain entities / VOs (PascalCase):
- Order
- Price
- SKU
- Quantity

Ports (dominio + sufijo):
- OrderRepository
- PricingService

Adapters (sufijo técnico):
- InMemoryOrderRepository
- PostgresOrderRepository

Use-cases (verbo en PascalCase):
- CreateOrder
- AddItemToOrder

DTOs:
- CreateOrderDTO (contiene `id`)
- AddItemDTO (orderId, sku, quantity)

Nota: este archivo es solo referencia.
