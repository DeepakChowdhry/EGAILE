// Future providers implement these server-side contracts; no payment processing is enabled.
export interface NotificationMessage {
  eventId: string;
  reference: string;
  dashboardUrl: string;
}
export interface DeliveryResult {
  accepted: boolean;
  providerReference?: string;
  retryable: boolean;
  safeCode?: string;
}
export interface NotificationProvider {
  send(message: NotificationMessage): Promise<DeliveryResult>;
}
export interface PaymentCheckoutRequest {
  orderId: string;
  amountMinor: number;
  currency: string;
  idempotencyKey: string;
}
export interface PaymentProvider {
  createCheckout(request: PaymentCheckoutRequest): Promise<{ checkoutId: string; url: string }>;
  verifyWebhook(
    rawBody: Uint8Array,
    headers: Headers,
  ): Promise<{
    eventId: string;
    orderId: string;
    state: string;
    amountMinor: number;
    currency: string;
  }>;
}
export interface CrmProvider {
  upsertLead(eventId: string, approvedFields: Record<string, string>): Promise<DeliveryResult>;
}
