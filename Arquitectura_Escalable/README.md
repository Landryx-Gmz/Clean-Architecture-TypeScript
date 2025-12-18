# Clean Architecture TypeScript - Proyecto de Ejemplo

## 📋 Descripción

Este proyecto implementa **Clean Architecture** con TypeScript, demostrando una estructura limpia de capas, inversión de dependencias, y patrones de inyección de dependencias.

## 🏗️ Estructura del Proyecto

```
src/
├── domain/                  # Capa más aislada - lógica pura de negocio
│   ├── entities/           # Entidades (Order)
│   ├── value-objects/      # Objetos de valor (Price, SKU, Quantity)
│   └── events/             # Eventos de dominio
├── application/            # Lógica de aplicación y orquestación
│   ├── ports/             # Contratos/interfaces (OrderRepository, PricingService)
│   ├── use-cases/         # Casos de uso (CreateOrder, AddItemToOrder)
│   └── dtos/              # Objetos de transferencia de datos
├── infrastructure/         # Implementaciones técnicas
│   ├── adapters/          # Adaptadores concretos (InMemory, Postgres)
│   ├── http/              # Controladores HTTP
│   └── persistence/       # Modelos de base de datos
├── config/                # Configuración
└── shared/                # Código compartido

tests/
├── application/           # Tests de casos de uso
└── shared/               # Tests unitarios generales

main.ts                    # Composition root (inyección de dependencias)
```

## 📝 Convenciones de Nombres

### Domain (entities y value-objects)
- **PascalCase**: `Order`, `Price`, `SKU`, `Quantity`
- Ejemplo: `src/domain/entities/Order.ts`

### Ports (interfaces)
- **Nombre de dominio + sufijo**: `OrderRepository`, `PricingService`
- Ejemplo: `src/application/ports/OrderRepository.ts`

### Adapters (implementaciones)
- **Sufijo técnico + nombre**: `InMemoryOrderRepository`, `PostgresOrderRepository`
- Ejemplo: `src/infrastructure/adapters/InMemoryOrderRepository.ts`

### Use-cases (casos de uso)
- **Verbo en PascalCase**: `CreateOrder`, `AddItemToOrder`, `GetOrderById`
- Ejemplo: `src/application/use-cases/CreateOrder.ts`

### DTOs (Data Transfer Objects)
- **PascalCase + sufijo DTO**: `CreateOrderDTO`, `AddItemDTO`
- Ejemplo: `src/application/dtos/CreateOrderDTO.ts`

### Controllers (HTTP)
- **Recurso + controlador**: `OrdersController`
- Métodos: `create()`, `findById()`, `update()`
- Ejemplo: `src/infrastructure/http/OrdersController.ts`

## 🔄 Barreras de Dependencia (Clean Architecture)

```
Domain (sin dependencias) ←─────┐
    ↑                           │
    │ puede depender de         │
    │                           │
Application (puertos + use-cases)
    ↑                           │
    │ puede depender de         │
    │                           │
Infrastructure (adaptadores)────┘
```

### Reglas estrictas:
- ✅ **Domain** nunca importa `application` ni `infrastructure`
- ✅ **Application** puede importar `domain` y sus propios puertos, pero NO adaptadores concretos
- ✅ **Infrastructure** puede importar `application` y `domain` para implementar contratos
- ✅ **Inyección de dependencias en composition root** (`main.ts`): `infrastructure` proporciona adaptadores a `application`

## 🚀 Cómo Ejecutar

### Ejecutar el ejemplo directo:
```powershell
npx tsx src/main.ts
```

Salida esperada:
```
Created order: order-1 total= 0
After add item, total= 20
```

### Ejecutar los tests:
```powershell
npm run test
```

### Compilar a JavaScript:
```powershell
npx tsc
```

### Ejecutar código compilado:
```powershell
node dist/main.js
```

## 📊 Ejemplo de Flujo: CreateOrder

1. **HTTP Request** → `OrdersController.create()`
2. **DTO** → `CreateOrderDTO` (contiene `{ id: string }`)
3. **Use-case** → `CreateOrder.execute(dto)`
4. **Domain** → `new Order(id)` crea entidad
5. **Port** → `OrderRepository.save(order)` (interfaz)
6. **Adapter** → `InMemoryOrderRepository.save()` o `PostgresOrderRepository.save()`
7. **Response** → Retorna `Order`

## 🔧 Importaciones con alias (opcional)

Para mejorar legibilidad, se pueden añadir alias en `tsconfig.json`:

```json
"paths": {
  "@domain/*": ["src/domain/*"],
  "@application/*": ["src/application/*"],
  "@infrastructure/*": ["src/infrastructure/*"]
}
```

Ejemplo de uso:
```typescript
import { OrderRepository } from "@application/ports/OrderRepository";
```

## 📚 Recursos de Aprendizaje

- **Domain-Driven Design (DDD)**: Entiende el lenguaje ubicuo y entidades
- **Clean Architecture** (Robert C. Martin): Capas, dependencias inversas
- **Dependency Injection**: Cómo se inyectan adaptadores en `main.ts`
- **Repository Pattern**: Abstracción de persistencia en `ports/`

## ✅ Testing

Los tests están en `tests/application/use-cases/`:
- `CreateOrder.spec.ts`: Tests de creación de órdenes (3 tests)
- `AddItemToOrder.spec.ts`: Tests de adición de items con type narrowing explícito (3 tests)

**Nota sobre type safety**: Los tests de `AddItemToOrder.spec.ts` utilizan type narrowing explícito (`if (order)`) para satisfacer TypeScript strict mode al acceder a propiedades potencialmente undefined. Esto asegura que el código sea 100% type-safe mientras mantiene la lógica clara y legible.

Ejecutar tests:
```powershell
npm run test
```

Ejecutar tests específicos:
```powershell
npm run test -- CreateOrder.spec.ts
```

## 📖 Más Información

Ver `INFORME.md` para una guía completa sobre el proceso de creación, flujos de ejecución y cómo estudiar la composición de la arquitectura paso a paso.
