-- Migración inicial consolidada
-- Fecha: 2026-01-03
-- Contiene la definición de tablas y los índices recomendados para esta arquitectura.

-- Tabla principal: orders
-- Guarda las órdenes (aggregate root).
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Tabla de items de orden: cada fila es un producto en una orden
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    UNIQUE(order_id, product_id)
);

-- Outbox para patrón de integridad eventual / publicación de eventos
CREATE TABLE outbox (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (aggregate_type, aggregate_id, event_type, created_at)
);

-- Índices existentes y recomendados
-- Índice parcial para seleccionar eventos no publicados por orden cronológica (útil para worker outbox)
CREATE INDEX IF NOT EXISTS idx_outbox_published_at_null ON outbox (created_at) WHERE published_at IS NULL;

-- Índice para acceder rápidamente a los items de una orden (join por order_id)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- Índices adicionales recomendados según uso en código y consultas comunes

-- Consultas: listar/consultar órdenes por cliente (historial cliente)
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders (customer_id);

-- Consultas: filtrar por estado y ordenar por fecha (p.ej. obtener órdenes "pending" recientes)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders (status, created_at);

-- Consultas: listados por fecha / paginación por fecha
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);

-- Consultas analíticas / búsquedas: qué órdenes contienen un producto
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);

-- Composite opcional: si se hacen consultas frecuentes por producto -> ordenar por order_id
CREATE INDEX IF NOT EXISTS idx_order_items_product_order ON order_items (product_id, order_id);

-- Outbox: índice por agregado para depuración/filtrado por agregado
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox (aggregate_type, aggregate_id);

-- Notas y consideraciones (comentadas):
-- 1) Tabla `products`: actualmente `order_items.product_id` es solo un UUID referencial.
--    Si en el futuro quieres persistir productos localmente y garantizar FK, crea:
--
--    CREATE TABLE products (
--        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--        sku TEXT UNIQUE NOT NULL,
--        name TEXT NOT NULL,
--        price NUMERIC(12,2) -- precio referencial
--    );
--
--    y entonces modifica `order_items.product_id` para referenciar `products(id)`:
--    ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id);
--
--    Mantener la FK es útil para integridad referencial, pero si los productos son externos
--    (servicio remoto) o quieres evitar bloqueo en borrado, puedes dejar el UUID suelto.

-- 2) Sincronización `total_amount`: la capa de persistencia debe mantener `orders.total_amount`
--    actualizado al guardar la entidad `Order`. El DDL ya define la columna.

-- 3) Sobre índices: usar `IF NOT EXISTS` hace la migración idempotente. Mide después
--    (pg_stat_user_indexes) y elimina índices no usados.

-- 4) Si usas particionado o retención histórica, considera particionar `orders` por fecha.
