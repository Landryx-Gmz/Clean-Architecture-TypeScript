import type { PricingService } from '@application/ports/PricingService';
import { Money } from '@domain/value-objects/Money';
import type { SKU } from '@domain/value-objects/SKU';
import type { Currency } from '@domain/value-objects/Currency';

/**
 * Servicio estático de precios que simula un servicio externo.
 * Mantiene un catálogo de precios predefinidos para diferentes SKUs y monedas.
 */
export class StaticPricingService implements PricingService {
    // Catálogo de precios: SKU -> Currency -> precio
    private readonly prices: Map<string, Map<Currency, number>> = new Map([
        ['LAPTOP001', new Map([['USD', 999.99], ['EUR', 899.99], ['MXN', 19999.99]])],
        ['MOUSE001', new Map([['USD', 29.99], ['EUR', 24.99], ['MXN', 599.99]])],
        ['KEYBOARD001', new Map([['USD', 79.99], ['EUR', 69.99], ['MXN', 1599.99]])],
        ['MONITOR001', new Map([['USD', 299.99], ['EUR', 269.99], ['MXN', 5999.99]])],
        ['HEADPHONES001', new Map([['USD', 149.99], ['EUR', 129.99], ['MXN', 2999.99]])],
    ]);

    /**
     * Obtiene el precio unitario de un SKU en la moneda especificada.
     * Simula una llamada a un servicio externo con una pequeña latencia.
     *
     * @param sku - El SKU del producto
     * @param currency - La moneda deseada
     * @returns El precio unitario del producto
     * @throws Error si el SKU no existe en el catálogo o no tiene precio para la moneda especificada
     */
    async getUnitPrice(sku: SKU, currency: Currency): Promise<Money> {
        // Simula latencia de red (opcional, puede removerse si no se desea)
        await this.simulateNetworkLatency();

        const skuPrices = this.prices.get(sku.value);
        if (!skuPrices) {
            throw new Error(`SKU no encontrado: ${sku.value}`);
        }

        const price = skuPrices.get(currency);
        if (price === undefined) {
            throw new Error(`Precio no disponible para SKU ${sku.value} en moneda ${currency}`);
        }

        return Money.of(price, currency);
    }

    /**
     * Simula la latencia de una llamada a un servicio externo.
     * Retorna inmediatamente para mantener el código simple.
     * Puede agregarse un delay real si se desea: await new Promise(resolve => setTimeout(resolve, 10));
     */
    private async simulateNetworkLatency(): Promise<void> {
        // Simulación de latencia mínima (puede descomentarse para simular delay real)
        // await new Promise(resolve => setTimeout(resolve, 10));
        return Promise.resolve();
    }
}

