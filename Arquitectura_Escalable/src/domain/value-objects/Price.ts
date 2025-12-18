// TODO: Value Object: Price (PascalCase)
// Inmutable: encapsula comportamiento y validaciones relacionadas al precio

export class Price {
    private readonly value: number;

    constructor(value: number) {
        if (value < 0) throw new Error('Price must be >= 0');
        this.value = value;
    }

    get amount(): number {
        return this.value;
    }
}
