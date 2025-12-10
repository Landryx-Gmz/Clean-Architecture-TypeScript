// TODO: Ejemplo de Event Listener
// Reacciona a eventos de dominio (p. ej. cuando se crea una orden)
// En un proyecto real: enviar emails, notificaciones, actualizar analytics, etc.

import type { OrderCreated } from "./OrderCreated.js";

export class SendOrderConfirmationEmailListener {
    async handle(event: OrderCreated): Promise<void> {
        console.log(
            `📧 Enviando email de confirmación para orden: ${event.orderId}`
        );
        // TODO: Implementar envío de email real (Sendgrid, Mailgun, etc.)
        // await emailService.send({
        //   to: user.email,
        //   subject: "Orden Confirmada",
        //   body: `Tu orden ${event.orderId} ha sido creada exitosamente`
        // });
    }
}

export class UpdateOrderAnalyticsListener {
    async handle(event: OrderCreated): Promise<void> {
        console.log(`📊 Actualizando analytics para orden: ${event.orderId}`);
        // TODO: Enviar a servicio de analytics (Google Analytics, Mixpanel, etc.)
        // await analytics.track('order_created', { orderId: event.orderId });
    }
}
