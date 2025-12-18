# INFORME: Clean Architecture TypeScript - Guía Completa

## 📌 Introducción

Este documento explica **cómo se construyó** este proyecto de Clean Architecture, **en qué orden se crearon** los archivos, **cómo se comunican** los componentes entre sí, y **cómo estudiar** la arquitectura de forma progresiva.

---

## 🏗️ Orden de Creación (Construcción de Abajo hacia Arriba)

### **Fase 1: Capa de Dominio (Domain Layer)**

**Objetivo**: Crear la lógica pura de negocio, sin dependencias de nada externo.

#### Paso 1.1: Entidades
```
src/domain/entities/Order.ts
```
- **Qué es**: La entidad principal del negocio que representa una orden.
- **Contenido**: Clase `Order` con propiedades (`id`, `items`) y métodos (`calculateTotal()`).
- **Por qué primero**: Las entidades son el corazón del dominio; no dependen de nada.
- **Características**:
  - Sin anotaciones de base de datos
  - Sin referencias a HTTP o APIs
  - Métodos de negocio puros (p. ej. `calculateTotal()`)

#### Paso 1.2: Value Objects
```
src/domain/value-objects/Price.ts
```
- **Qué es**: Objetos de valor inmutables que encapsulan lógica y validaciones.
- **Contenido**: Clase `Price` con validación (`value >= 0`).
- **Por qué VOs**: Representan conceptos del dominio (precio no puede ser negativo).
- **Características**:
  - Inmutables (`private readonly`)
  - Validaciones en constructor
  - Pueden tener métodos de comportamiento

### **Fase 2: Capa de Aplicación - Puertos (Application Layer - Contracts)**

**Objetivo**: Definir contratos que especifican cómo se comunica la aplicación con el exterior.

#### Paso 2.1: Puertos (Interfaces)
```
src/application/ports/OrderRepository.ts
src/application/ports/PricingService.ts
```
- **Qué son**: Interfaces que definen contratos sin implementación.
- **Contenido**:
  - `OrderRepository`: métodos `save()`, `findById()`
  - `PricingService`: método `getPriceForSKU()`
- **Por qué**: Permiten que los use-cases dependan de abstracciones, no de implementaciones concretas.
- **Relación con Domain**: Los puertos retornan/aceptan entidades del dominio (p. ej. `Order`).

#### Paso 2.2: DTOs (Data Transfer Objects)
```
src/application/dtos/CreateOrderDTO.ts
src/application/dtos/AddItemDTO.ts
```
- **Qué son**: Objetos que llevan datos desde la capa HTTP hacia los use-cases.
- **Contenido**: Interfaces simples con las propiedades necesarias.
- **Por qué**: Desacopla la entrada HTTP del dominio (no todos los campos de HTTP son del dominio).
- **Ejemplo**:
  ```typescript
  interface CreateOrderDTO {
    id: string; // solo lo que necesita el caso de uso
  }
  ```

### **Fase 3: Capa de Aplicación - Casos de Uso (Application Layer - Use-Cases)**

**Objetivo**: Orquestar la lógica de aplicación usando el dominio y los puertos.

#### Paso 3.1: CreateOrder Use-Case
```
src/application/use-cases/CreateOrder.ts
```
- **Qué hace**:
  1. Recibe un `CreateOrderDTO`
  2. Crea una instancia de `Order` (dominio)
  3. Persiste usando `OrderRepository` (puerto)
  4. Retorna la orden creada
- **Dependencias**:
  - `Order` (dominio, importa la clase)
  - `OrderRepository` (puerto, importa la interfaz)
  - `CreateOrderDTO` (aplicación, importa la interfaz)
- **Código simplificado**:
  ```typescript
  export class CreateOrder {
    constructor(private readonly repo: OrderRepository) {}
    
    async execute(dto: CreateOrderDTO): Promise<Order> {
      const order = new Order(dto.id);
      await this.repo.save(order);
      return order;
    }
  }
  ```

#### Paso 3.2: AddItemToOrder Use-Case
```
src/application/use-cases/AddItemToOrder.ts
```
- **Qué hace**:
  1. Recibe `AddItemDTO` (orderId, sku, quantity) y un `Price`
  2. Busca la orden usando `OrderRepository`
  3. Añade el item a la orden (lógica de dominio)
  4. Persiste cambios
- **Dependencias**:
  - `OrderRepository` (puerto)
  - `Price` (dominio)
  - `AddItemDTO` (aplicación)

### **Fase 4: Capa de Infraestructura - Adaptadores (Infrastructure Layer - Adapters)**

**Objetivo**: Implementar los puertos definidos en aplicación con tecnologías específicas.

#### Paso 4.1: InMemoryOrderRepository
```
src/infrastructure/adapters/InMemoryOrderRepository.ts
```
- **Qué es**: Implementación de `OrderRepository` usando un `Map` en memoria.
- **Implementa**: la interfaz `OrderRepository`
- **Métodos**:
  - `save(order: Order)`: guarda en el Map
  - `findById(id: string)`: recupera del Map
- **Cuándo usarlo**: Desarrollo, testing, sin base de datos real.
- **Código simplificado**:
  ```typescript
  export class InMemoryOrderRepository implements OrderRepository {
    private store = new Map<string, Order>();
    
    async save(order: Order): Promise<void> {
      this.store.set(order.id, order);
    }
  }
  ```

#### Paso 4.2: PostgresOrderRepository
```
src/infrastructure/adapters/PostgresOrderRepository.ts
```
- **Qué es**: Implementación futura con Postgres (stub por ahora).
- **Implementa**: la interfaz `OrderRepository`
- **Futuro**: Conectará a base de datos real, realizará queries SQL.

#### Paso 4.3: Controllers HTTP
```
src/infrastructure/http/OrdersController.ts
```
- **Qué es**: Controlador HTTP que recibe requests y orquesta use-cases.
- **Métodos**:
  - `create(req)`: recibe HTTP, llama a `CreateOrder.execute()`, devuelve respuesta
- **Dependencias**: recibe use-cases inyectados en constructor
- **Código simplificado**:
  ```typescript
  export class OrdersController {
    constructor(private createOrder: CreateOrder) {}
    
    async create(req: { body: any }) {
      const dto: CreateOrderDTO = { id: req.body.id };
      return this.createOrder.execute(dto);
    }
  }
  ```

#### Paso 4.4: Persistence Models
```
src/infrastructure/persistence/order.model.ts
```
- **Qué es**: Interfaz que representa cómo se almacena Order en la BD.
- **Relación**: Mapeo entre entidad `Order` (dominio) y `OrderModel` (persistencia).

### **Fase 5: Composition Root (Inyección de Dependencias)**

**Objetivo**: Ensamblar todas las piezas, inyectando adaptadores concretos en los use-cases.

#### Paso 5.1: main.ts (Bootstrap/Composition Root)
```
src/main.ts
```
- **Qué es**: Punto central donde se instancian todos los componentes y se inyectan las dependencias.
- **Pasos**:
  1. Crear una instancia de `InMemoryOrderRepository` (u otro adapter)
  2. Inyectarlo en `CreateOrder` use-case
  3. Inyectarlo en `AddItemToOrder` use-case
  4. Pasar use-cases al `OrdersController`
- **Código simplificado**:
  ```typescript
  const repo = new InMemoryOrderRepository();
  const createOrder = new CreateOrder(repo);
  const addItemToOrder = new AddItemToOrder(repo);
  const ordersController = new OrdersController(createOrder, addItemToOrder);
  ```
- **Ventaja**: Al cambiar de `InMemoryOrderRepository` a `PostgresOrderRepository`, solo cambias esta línea.

### **Fase 6: Tests**

**Objetivo**: Verificar que los use-cases funcionan correctamente con mocks.

#### Paso 6.1: Tests de CreateOrder
```
tests/application/use-cases/CreateOrder.spec.ts
```
- **Qué prueba**:
  - ¿Se crea la orden correctamente?
  - ¿Se persiste en el repositorio?
  - ¿Retorna una entidad Order con métodos de dominio?

#### Paso 6.2: Tests de AddItemToOrder
```
tests/application/use-cases/AddItemToOrder.spec.ts
```
- **Qué prueba**:
  - ¿Se añade un item a la orden?
  - ¿Se calcula el total correctamente?
  - ¿Lanza error si la orden no existe?
- **Nota TypeScript**: Utiliza type narrowing explícito (`if (order)`) para satisfacer TypeScript strict mode al acceder a propiedades potencialmente undefined. Esto asegura 100% type-safety mientras mantiene la lógica clara:
  ```typescript
  const order = await repository.findById(orderId);
  expect(order).toBeDefined();
  if (order) {
    expect(order.items).toHaveLength(1);
    expect(order.items[0]).toBeDefined();
    expect(order.items[0]!.sku).toBe("SKU-ABC");
  }
  ```

---

## 🔄 Flujo de Comunicación: De HTTP a Persistencia

### **Caso de Uso: Crear una Orden**

```
HTTP Request
    ↓
OrdersController.create(req)
    ↓ (recibe request HTTP)
    ├─→ Extrae datos → CreateOrderDTO { id: "order-1" }
    ├─→ Inyecta en CreateOrder use-case
    ↓
CreateOrder.execute(dto)
    ├─→ Crea Order (dominio): new Order("order-1")
    ├─→ Inyecta en OrderRepository.save(order)
    ↓
OrderRepository (interfaz/contrato)
    ├─→ Implementación: InMemoryOrderRepository.save(order)
    ├─→ Guarda en Map interno
    ↓
Response: Order entity retorna al controller
    ↓
HTTP Response con JSON
```

### **Caso de Uso: Añadir Item a Orden**

```
HTTP Request
    ↓
OrdersController.addItem(req)
    ├─→ Extrae datos → AddItemDTO { orderId, sku, quantity }
    ├─→ Crea Price (dominio): new Price(10)
    ├─→ Inyecta en AddItemToOrder use-case
    ↓
AddItemToOrder.execute(dto, price)
    ├─→ Busca Order: OrderRepository.findById(orderId)
    ├─→ Valida que exista
    ├─→ Añade item: order.items.push(...)
    ├─→ Persiste: OrderRepository.save(order)
    ↓
Retorna Order actualizada
    ↓
HTTP Response
```

---

## 📚 Ruta de Estudio Recomendada

Para entender y estudiar esta arquitectura de forma progresiva, sigue estos pasos:

### **Semana 1: Fundamentos de Domain-Driven Design (DDD)**

1. **Empieza aquí**: `src/domain/entities/Order.ts`
   - Entiende qué es una entidad
   - Aprende sobre invariantes (reglas de negocio)
   - Observa cómo `calculateTotal()` encapsula lógica de dominio

2. **Luego**: `src/domain/value-objects/Price.ts`
   - Aprende sobre Value Objects
   - Por qué son inmutables
   - Cómo validan en constructor

### **Semana 2: Puertos e Inversión de Dependencias**

3. **Lee**: `src/application/ports/OrderRepository.ts`
   - Entiende qué es un puerto (interfaz)
   - Por qué permite desacoplamiento
   - Relación con el principio de inversión de dependencias

4. **Comprende**: `src/application/dtos/`
   - Por qué los DTOs desacoplan HTTP del dominio
   - Cómo fluyen datos entre capas

### **Semana 3: Casos de Uso y Orquestación**

5. **Estudia**: `src/application/use-cases/CreateOrder.ts`
   - Cómo un use-case orquesta dominio + puertos
   - Inyección de puertos en constructor
   - Lógica asincrónica

6. **Analiza**: `src/application/use-cases/AddItemToOrder.ts`
   - Validación usando puertos
   - Composición de entidades y VOs

### **Semana 4: Adaptadores y Composición**

7. **Implementa**: `src/infrastructure/adapters/InMemoryOrderRepository.ts`
   - Cómo implementar un puerto
   - La clase `implements OrderRepository`
   - Almacenamiento en memoria

8. **Observa**: `src/main.ts` (Composition Root)
   - Cómo se inyectan dependencias
   - Por qué esta es la línea divisoria entre capas

9. **Lee**: `src/infrastructure/http/OrdersController.ts`
   - Cómo entra HTTP en la aplicación
   - Transformación de requests a DTOs
   - Orquestación de use-cases

### **Semana 5: Testing y Validación**

10. **Escribe/Lee**: `tests/application/use-cases/CreateOrder.spec.ts`
    - Cómo testear use-cases aisladamente
    - Mock de repositorio
    - Assertions sobre comportamiento

11. **Ejecuta y juega**:
    ```powershell
    npx tsx src/main.ts
    npm run test
    ```
    - Observa el flujo en acción
    - Modifica datos, ve cómo cambia la salida

---

## 🔐 Type Safety en TypeScript Strict Mode

Este proyecto utiliza TypeScript con `strict: true` para máxima seguridad de tipos. Esto significa que el compilador es estricto con valores potencialmente undefined/null.

### **Ejemplo: Acceso a Propiedades Opcionales en Tests**

En `AddItemToOrder.spec.ts`, cuando recuperamos una orden del repositorio, el tipo de retorno es `Order | null`:

```typescript
async findById(id: string): Promise<Order | null>
```

Para acceder de forma segura a propiedades de `order` que podrían no existir, usamos **type narrowing**:

```typescript
const order = await repository.findById(orderId);
expect(order).toBeDefined();  // ← asegura que no es null

if (order) {  // ← type narrowing: ahora order es Order, no Order | null
  expect(order.items).toHaveLength(1);
  expect(order.items[0]!.sku).toBe("SKU-ABC");  // ← ! asegura acceso seguro
}
```

### **Técnicas de Type Narrowing Usadas**

1. **if (value)**: Comprueba que el valor no es null/undefined
2. **expect().toBeDefined()**: Aserción con mensaje claro
3. **! (non-null assertion)**: Indica que has verificado que no es undefined

### **Por Qué Es Importante**

- ✅ Previene bugs en tiempo de compilación, no en runtime
- ✅ El código es más seguro y predecible
- ✅ IDEs ofrecen mejor autocompletar y ayuda
- ✅ Documenta intencionalmente el flujo de datos

---

### **1. Direccionalidad de Dependencias**
```
Domain (∅)          ← no depende de nada
  ↑
Application (domain + ports)  ← depende de domain y puertos
  ↑
Infrastructure (application + domain)  ← depende de application y domain
```

### **2. Inversión de Dependencias (Dependency Inversion)**
- Los use-cases NO conocen `InMemoryOrderRepository` ni `PostgresOrderRepository`
- Solo conocen `OrderRepository` (la interfaz)
- La inyección en `main.ts` "invierte" la dependencia

### **3. Inyección Constructor**
```typescript
// Good ✅
constructor(private readonly repo: OrderRepository) {}

// Bad ❌
const repo = new InMemoryOrderRepository();  // acoplamiento
```

### **4. Flujo de Datos**
```
HTTP → DTO → Use-case → Domain + Ports → Adapter → Persistencia
           ↓
        Response
```

### **5. Testabilidad**
- Porque los use-cases dependen de puertos (no de implementaciones), 
  puedes inyectar fácilmente un mock en tests.

---

## 🔧 Ejercicios Prácticos

### **Ejercicio 1: Añadir un Nuevo Use-Case**
1. Crea `GetOrderById` use-case
2. Debe usar `OrderRepository.findById()`
3. Devuelve la orden o null

### **Ejercicio 2: Implementar un Nuevo Adapter**
1. Crea `JsonFileOrderRepository` que persista a archivos
2. Implementa `OrderRepository`
3. Cambia `main.ts` para usarlo

### **Ejercicio 3: Cambiar el Almacenamiento**
1. Modifica `main.ts` para usar `PostgresOrderRepository` en lugar de `InMemory`
2. Observa que el código de use-cases NO cambia

### **Ejercicio 4: Crear un Test Completo**
1. Escribe un test que cree una orden, añada items, y verifique el total
2. Verifica persistencia

---

## 📖 Conclusión

Esta estructura permite:
- ✅ Cambiar adaptadores sin tocar lógica de negocio
- ✅ Testear use-cases sin base de datos
- ✅ Escalabilidad: agregar nuevos casos de uso sin romper existentes
- ✅ Mantenibilidad: código organizado y con responsabilidades claras
- ✅ Entendimiento del dominio: el código refleja el lenguaje del negocio

**Próximos pasos**: 
- Implementa `PricingService` con una API externa
- Añade eventos de dominio (OrderCreated, ItemAdded)
- Integra con una base de datos real (Postgres, MongoDB)
- Crea validadores en el dominio
