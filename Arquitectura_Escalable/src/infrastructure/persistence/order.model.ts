// TODO: Modelo de persistencia DB para Order (infrastructure.persistence)
export interface OrderModel {
    id: string;
    items: Array<{ sku: string; quantity: number; price: number }>;
}
