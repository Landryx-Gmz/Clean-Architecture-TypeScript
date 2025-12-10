// TODO: Port: PricingService
// Nombre de puerto: PricingService (dominio + sufijo Service)
// Define contrato para obtener precios (p. ej. desde un servicio externo)

import type { Price } from "../../domain/value-objects/Price.js";

export interface PricingService {
    getPriceForSKU(sku: string): Promise<Price>;
}
