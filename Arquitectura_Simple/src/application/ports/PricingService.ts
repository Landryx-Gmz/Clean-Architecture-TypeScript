import type { Money } from '@domain/value-objects/Money';
import type { SKU } from '@domain/value-objects/SKU';
import type { Currency } from '@domain/value-objects/Currency';

export interface PricingService {
    getUnitPrice(sku: SKU, currency: Currency): Promise<Money>;
}

