// TODO: Entidad del dominio: Order
// Nombre en PascalCase: Order
// Responsable de lógica agregada (validaciones y reglas de negocio)

export class Order {
    id: string;
    items: Array<{ sku: string; quantity: number; price: number }> = [];

    constructor(id: string) {
        this.id = id;
    }

    // TODO: agregar métodos de dominio (ej. calculateTotal, addItem con reglas)
    calculateTotal(): number {
        return this.items.reduce((s, i) => s + i.price * i.quantity, 0);
    }
}
