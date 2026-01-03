# 📋 Guía de Soluciones de Errores - Clean Architecture TypeScript

Este documento explica todos los errores encontrados en el proyecto y cómo se solucionaron. Está diseñado para que sea fácil de entender incluso si tienes poco background en TypeScript.

---

## 🎯 ¿Qué son estos errores?

Cuando compilamos código TypeScript (transformarlo a JavaScript), el compilador verifica que todo sea correcto. Si encuentra problemas, nos lo avisa con errores. Estos errores nos ayudan a escribir código más seguro y sin bugs.

---

## ❌ Error #1: `dotenv/config` no se encuentra

### 📍 Ubicación
Archivo: `src/composition/config.ts` línea 2

### 🔴 Problema Original
```typescript
import 'dotenv/config';
```

**¿Qué significa el error?**
```
Cannot find module 'dotenv/config' or its corresponding type declarations.
```

Esto significa que TypeScript no puede encontrar el módulo `dotenv/config`. Es como cuando busca un archivo que no existe en tu computadora.

### ⚠️ ¿Por qué pasó?

Hay dos razones:

1. **Configuración estricta de TypeScript**: Tu proyecto tiene `verbatimModuleSyntax: true` en `tsconfig.json`. Esta configuración es muy exigente con cómo importamos módulos.

2. **Versión antigua de dotenv**: La versión 9.0.0 que tenías originalmente tiene problemas con esta configuración.

### ✅ Solución

**Paso 1:** Cambiar la forma de importar

En lugar de:
```typescript
import 'dotenv/config';
```

Usa:
```typescript
import dotenv from 'dotenv';
dotenv.config();
```

**¿Cuál es la diferencia?**
- `import 'dotenv/config'` - Intenta importar un submódulo específico (que no funciona bien)
- `import dotenv from 'dotenv'` - Importa todo el módulo dotenv
- `dotenv.config()` - Llama la función `config()` que carga las variables de entorno

**Paso 2:** Actualizar dotenv a la última versión

```bash
npm install dotenv@latest
```

Esto instala una versión más nueva que tiene mejor soporte para TypeScript.

### 📂 Archivo modificado
```typescript
// ANTES
import { z } from 'zod';
import 'dotenv/config';

// DESPUÉS
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();
```

---

## ❌ Error #2: Módulo `pg` no tiene tipos

### 📍 Ubicación
Archivo: `src/infrastructure/persistence/postgres/PostgresOrderRepository.ts` línea 1

### 🔴 Problema Original
```typescript
import { Client, PoolClient } from 'pg';
```

**¿Qué significa el error?**
```
Cannot find module 'pg' or its corresponding type declarations.
```

### ⚠️ ¿Por qué pasó?

TypeScript necesita dos cosas para cada módulo:
1. **El módulo en sí** - El código que hace algo (ya lo tenías: `npm install pg`)
2. **Sus tipos (type declarations)** - Instrucciones que describen qué funciones tiene y qué parámetros esperan

Sin los tipos, TypeScript no puede verificar que estés usando `pg` correctamente.

### ✅ Solución

Instalar el paquete de tipos para `pg`:

```bash
npm install --save-dev @types/pg
```

**¿Qué hace este comando?**
- `npm install` - Instala un paquete
- `--save-dev` - Lo instala como dependencia de desarrollo (solo necesitamos durante el desarrollo)
- `@types/pg` - El paquete de tipos oficial para `pg`

### 📝 Explicación analógica

Imagina que tienes:
- **`pg`** = Un libro de recetas en un idioma que no entiendes
- **`@types/pg`** = Una traducción del libro con explicaciones claras

TypeScript necesita la traducción (tipos) para entender qué hacer con el libro (módulo).

---

## ❌ Error #3: Import de tipos con `verbatimModuleSyntax`

### 📍 Ubicación
Archivo: `src/infrastructure/persistence/postgres/PostgresOrderRepository.ts` línea 1

### 🔴 Problema Original
```typescript
import { Client, PoolClient } from 'pg';
```

**¿Qué significa el error?**
```
'PoolClient' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
```

### ⚠️ ¿Por qué pasó?

En TypeScript hay dos tipos de cosas que podemos importar:

1. **Valores/Funciones** - Código que realmente ejecuta algo en tiempo de ejecución
2. **Tipos** - Información que solo usa TypeScript para validar, pero desaparece en el JavaScript final

Con `verbatimModuleSyntax: true`, TypeScript es muy estricto: necesita que especifiques cuál es cada uno.

`PoolClient` es un **tipo**, no un valor.

### ✅ Solución

Usar `type` antes de importar tipos:

```typescript
// ANTES
import { Client, PoolClient } from 'pg';

// DESPUÉS
import { Client, type PoolClient } from 'pg';
```

**¿Qué significa `type` aquí?**

Le estamos diciendo a TypeScript: "PoolClient es solo un tipo, no es código real que vaya a ejecutarse".

### 📝 Analogía

```typescript
// Sin 'type' - Estamos diciendo "trae todo"
import { Client, PoolClient } from 'pg';
// TypeScript: ¿Pero PoolClient es un tipo! ¡Debe ser type-only!

// Con 'type' - Específico qué es cada cosa
import { Client, type PoolClient } from 'pg';
// TypeScript: ¡Perfecto! Así está claro.
```

---

## ❌ Error #4: Interfaz `OrderRepository` desactualizada

### 📍 Ubicación
Archivo: `src/application/ports/OrderRepository.ts`

### 🔴 Problema Original
```typescript
export interface OrderRepository {
    findById(id: OrderId): Promise<Order | null>;
    save(order: Order): Promise<void>;
}
```

Las implementaciones (PostgresOrderRepository e InMemoryOrderRepository) retornaban:
```typescript
Promise<Result<Order, AppError>>  // findById
Promise<Result<void, AppError>>   // save
```

**¿Qué significa el error?**
```
Type '(order: Order) => Promise<Result<void, AppError>>' is not assignable to type '(order: Order) => Promise<void>'
```

Traducción: "Dijiste que devolvería `Promise<void>`, pero en realidad devuelves `Promise<Result<void, AppError>>`"

### ⚠️ ¿Por qué pasó?

Imagina que pides un taxi y dices "tráeme un taxi rojo" (contrato), pero traes un taxi rojo con un mapa adentro (implementación). El mapa es útil, pero no es lo que se acordó.

Un **contrato (interfaz)** establece lo que deben cumplir las implementaciones. Si cambias la implementación, debes actualizar el contrato.

### ✅ Solución

Actualizar la interfaz para que coincida con la implementación real:

```typescript
// ANTES
export interface OrderRepository {
    findById(id: OrderId): Promise<Order | null>;
    save(order: Order): Promise<void>;
}

// DESPUÉS
import type { Result } from '@shared/Result';
import type { AppError } from '../error';

export interface OrderRepository {
    findById(id: OrderId | string): Promise<Result<Order, AppError>>;
    save(order: Order): Promise<Result<void, AppError>>;
    exists?(id: OrderId): Promise<boolean>;
}
```

**¿Qué cambió y por qué?**

| Antes | Después | Razón |
|-------|---------|-------|
| `Promise<Order \| null>` | `Promise<Result<Order, AppError>>` | Para manejar errores explícitamente |
| `id: OrderId` | `id: OrderId \| string` | La BD devuelve strings, no objetos OrderId |
| `Promise<void>` | `Promise<Result<void, AppError>>` | Para que el repositorio reporte errores |

### 📝 Explicación de `Result<T, E>`

`Result` es un tipo que representa:
- **Success**: Operación exitosa (devuelve un valor)
- **Failure**: Operación fallida (devuelve un error)

```typescript
// Result<Order, AppError> significa:
// - Si éxito: devuelve un Order
// - Si error: devuelve un AppError
```

---

## ❌ Error #5: PostgresOrderRepository accedía a propiedades privadas

### 📍 Ubicación
Archivo: `src/infrastructure/persistence/postgres/PostgresOrderRepository.ts`

### 🔴 Problemas Originales

```typescript
// Error 1: Accediendo a 'items' que es privada
const totalAmount = order.items.reduce((sum, item) => ...);

// Error 2: Accediendo a propiedades que no existen
order.customerId
order.status
order.totalAmount.currency

// Error 3: 'items' es privado
for (const item of order.items) { ... }

// Error 4: OrderItem no tiene 'id', 'productId'
item.id.value
item.productId.value
```

**¿Qué significa el error?**
```
Property 'items' is private and only accessible within class 'Order'.
```

"Intentas acceder a `items`, pero es privado (solo se puede usar dentro de la clase Order)"

### ⚠️ ¿Por qué pasó?

**Privacidad en clases** es un concepto importante:

```typescript
class Banco {
    private dinero = 1000;  // PRIVADO: solo accesible dentro de Banco
    
    public obtenerDinero() {  // PÚBLICO: accesible desde afuera
        return this.dinero;
    }
}

// ✅ Correcto
const banco = new Banco();
console.log(banco.obtenerDinero());  // Usa el método público

// ❌ Error
console.log(banco.dinero);  // No puedes acceder directamente
```

En tu proyecto:
- `Order.items` es **privada** → No puedes acceder directamente
- Debes usar `Order.getItems()` que es **pública**

### ✅ Solución

Usar los métodos públicos en lugar de acceder directamente a propiedades privadas:

**ANTES:**
```typescript
async save(order: Order): Promise<Result<void, AppError>> {
    // ❌ Acceso directo a privada
    const totalAmount = order.items.reduce((sum, item) => 
        sum + item.unitPrice.amount * item.quantity, 0);
    
    // ❌ Propiedades que no existen
    await connection.query(upsertQuery, [
        order.id.value,
        order.customerId,      // ❌ No existe
        order.status,          // ❌ No existe
        totalAmount,
        order.totalAmount.currency,  // ❌ No existe
    ]);
}
```

**DESPUÉS:**
```typescript
async save(order: Order): Promise<Result<void, AppError>> {
    // ✅ Usar método público getItems()
    const items = order.getItems();
    const totalAmount = items.reduce((sum, item) => 
        sum + item.unitPrice.amount * item.quantity, 0);
    
    // ✅ Usar solo propiedades que realmente existen
    await connection.query(upsertQuery, [
        order.id.value,
        'USD',  // Valor por defecto
        totalAmount,
    ]);
}
```

**¿Qué métodos públicos tiene Order?**

```typescript
// En la clase Order tienes:
class Order {
    getItems(): ReadonlyArray<OrderItem> { ... }  // ✅ Público
    total(): Money { ... }                        // ✅ Público
    pullEvents(): DomainEvent[] { ... }           // ✅ Público
}
```

### 📝 Principio de Encapsulación

Es un concepto importante:
- **Público** = Lo que otros pueden usar (contrato garantizado)
- **Privado** = Detalles internos (pueden cambiar sin avisar)

Usando métodos públicos, el código es más robusto. Si la clase Order cambia internamente, tu repositorio sigue funcionando.

---

## ❌ Error #6: Use cases no desempaquetaban `Result`

### 📍 Ubicación
Archivos: 
- `src/application/use-case/AddItemToOrder.ts`
- `src/application/use-case/CreateOrder.ts`

### 🔴 Problema Original
```typescript
async execute(input: AddItemToOrderDTO): Promise<Result<Order, AppError>> {
    const orderId = new OrderId(input.orderId);
    const order = await this.deps.repository.findById(orderId);  // ❌ Problema aquí
    
    if (!order) {
        return fail(notFoundError('orden', input.orderId));
    }

    // Intentar usar order directamente
    const currency = order.total().currency;  // ❌ order es Result, no Order
}
```

**¿Qué significa el error?**
```
Property 'total' does not exist on type 'Result<Order, AppError>'.
Property 'total' does not exist on type 'Success<Order>'.
```

"Intentas llamar `total()` en un `Result`, pero `total()` solo existe en `Order`"

### ⚠️ ¿Por qué pasó?

`findById()` ahora devuelve `Result<Order, AppError>`, que puede ser:
- `Success<Order>` - Contiene la orden
- `Failure<AppError>` - Contiene el error

Pero en el código anterior, asumías que devolvía directamente `Order | null`.

### ✅ Solución

Desempacar el `Result` antes de usarlo:

**Paso 1: Entender Result**

```typescript
type Result<T, E> = Success<T> | Failure<E>;

// Success<Order>
{
    kind: 'success',
    value: Order  // ← La orden está aquí
}

// Failure<AppError>
{
    kind: 'failure',
    error: AppError  // ← El error está aquí
}
```

**Paso 2: Verificar el resultado y extraer el valor**

```typescript
// ANTES
const order = await this.deps.repository.findById(orderId);  // Result<Order, AppError>

// DESPUÉS - Opción 1: Usando isSuccess
const orderResult = await this.deps.repository.findById(orderId);

if (!isSuccess(orderResult)) {
    // Es un error
    return orderResult;  // Propagar el error
}

// Ahora sí es seguro acceder a orderResult.value
const order = orderResult.value;
```

**Paso 3: Código completo**

```typescript
async execute(input: AddItemToOrderDTO): Promise<Result<Order, AppError>> {
    try {
        const orderId = new OrderId(input.orderId);
        
        // Obtener el resultado
        const orderResult = await this.deps.repository.findById(orderId);
        
        // Verificar si es éxito
        if (!isSuccess(orderResult)) {
            // Si no es éxito, devolver el error tal cual
            return orderResult;
        }
        
        // Ahora extraer el valor (la orden)
        const order = orderResult.value;
        
        // Usar la orden normalmente
        const currency = order.total().currency;
        const sku = new SKU(input.sku);
        const unitPrice = await this.deps.pricing.getUnitPrice(sku, currency);
        const orderItem = OrderItem.of(sku, unitPrice, input.quantity);

        order.addItem(orderItem);

        // Guardar también retorna Result
        const saveResult = await this.deps.repository.save(order);
        
        if (!isSuccess(saveResult)) {
            // Si guardar falló, devolver el error
            return fail(saveResult.error);
        }

        const events = order.pullEvents();
        await this.deps.eventBus.publish(events);

        return ok(order);
    } catch (error) {
        return fail(mapToAppError(error, 'orden', input.orderId));
    }
}
```

### 📝 Funciones helper para Result

```typescript
// Verificar si es éxito
isSuccess(result)  // true o false

// Acceder al valor (solo si es éxito)
result.value  // T

// Acceder al error (solo si es fallo)
result.error  // E

// Crear éxito
ok(value)  // Success<T>

// Crear error
fail(error)  // Failure<E>
```

---

## ❌ Error #7: Tests desempaquetaban mal `Result`

### 📍 Ubicación
Archivo: `tests/acceptance/addItemToOrder.acceptance.spec.ts`

### 🔴 Problema Original
```typescript
const stored = await repo.findById(new OrderId(orderId));
expect(stored).not.toBeNull();

// ❌ Intentar usar directamente
const total = stored?.total();
const items = stored?.getItems() ?? [];
```

**¿Qué significa el error?**
```
Property 'total' does not exist on type 'Result<Order, AppError>'.
```

`stored` es un `Result`, no un `Order`.

### ✅ Solución

Desempacar el resultado en los tests:

```typescript
// ANTES
const stored = await repo.findById(new OrderId(orderId));
expect(stored).not.toBeNull();
const total = stored?.total();

// DESPUÉS
const storedResult = await repo.findById(new OrderId(orderId));
expect(isSuccess(storedResult)).toBe(true);

const stored = isSuccess(storedResult) ? storedResult.value : null;
expect(stored).not.toBeNull();
const total = stored?.total();
```

**Explicación:**
1. Obtener el resultado
2. Verificar que es éxito (es lo que esperamos)
3. Extraer el valor si es éxito
4. Usar normalmente

---

## 📊 Tabla Resumen de Errores

| Error | Archivo | Causa | Solución |
|-------|---------|-------|----------|
| #1 | config.ts | Import incorrecto de dotenv | Importar módulo + llamar `.config()` |
| #2 | PostgresOrderRepository.ts | Falta tipos de `pg` | `npm install --save-dev @types/pg` |
| #3 | PostgresOrderRepository.ts | Import de tipo sin `type` | Usar `import { type PoolClient }` |
| #4 | OrderRepository.ts | Interfaz desactualizada | Actualizar para usar `Result<T, E>` |
| #5 | PostgresOrderRepository.ts | Acceso a privados | Usar métodos públicos (`getItems()`) |
| #6 | AddItemToOrder.ts, CreateOrder.ts | No desempacar `Result` | Usar `isSuccess()` y extraer `.value` |
| #7 | Tests | No desempacar `Result` | Mismo que #6, en tests |

---

## 🔑 Conceptos Clave Aprendidos

### 1. **Tipos vs Valores**
- **Tipos**: Información para TypeScript (desaparecen en JS)
- **Valores**: Código real que se ejecuta

### 2. **Privacidad (Encapsulación)**
- **`private`**: Solo accesible dentro de la clase
- **`public`**: Accesible desde cualquier lado

### 3. **Result<T, E>**
- Representa operaciones que pueden fallar
- Siempre desempacar antes de usar

### 4. **Type Safety**
- TypeScript verifica errores antes de ejecutar
- Previene bugs en tiempo de compilación

---

## ✅ Verificación Final

```bash
# Compilar el proyecto
npm run build

# Ejecutar tests
npm run test

# Debería ver:
# ✓ Test Files  3 passed (3)
# ✓ Tests  14 passed (14)
```

Si todo está verde (✓), ¡has solucionado todos los errores!

---

## 📚 Recursos para Aprender Más

### TypeScript
- [Documentación oficial TypeScript](https://www.typescriptlang.org/docs/)
- Tipos: [Type Basics](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- Clases: [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)

### Patrones
- `Result` type: [Rust-inspired error handling](https://docs.rs/std/result/enum.Result.html)
- Clean Architecture: [Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### npm
- `dotenv`: [npm dotenv](https://www.npmjs.com/package/dotenv)
- `@types/pg`: [npm @types/pg](https://www.npmjs.com/package/@types/pg)

---

**Generado:** 3 de enero de 2026  
**Proyecto:** Clean Architecture TypeScript  
**Estado:** ✅ Sin errores
