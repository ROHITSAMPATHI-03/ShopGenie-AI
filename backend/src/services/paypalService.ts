import { env } from '../config/env.js';

export interface PayPalAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface PayPalCreateOrderResult {
  id: string; // PayPal Order ID
  status: string;
}

export interface PayPalCaptureResult {
  id: string;
  status: string; // COMPLETED | PENDING | FAILED
  captureId?: string;
  amount: string;
  currency: string;
  debugId?: string;
}

export class PayPalService {
  private static cachedToken: { token: string; expiresAt: number } | null = null;

  static getBaseUrl(): string {
    return env.PAYPAL_ENV === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  static isConfigured(): boolean {
    return Boolean(env.PAYPAL_CLIENT_ID?.trim() && env.PAYPAL_CLIENT_SECRET?.trim());
  }

  static async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('PayPal Sandbox credentials are not configured in environment variables');
    }

    const now = Date.now();
    if (this.cachedToken && this.cachedToken.expiresAt > now + 60000) {
      return this.cachedToken.token;
    }

    const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PayPal OAuth Error]', response.status, errorText);
      throw new Error(`PayPal authentication failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as PayPalAuthToken;
    this.cachedToken = {
      token: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    };

    return data.access_token;
  }

  static async createOrder(orderId: string, amountUsdString: string): Promise<PayPalCreateOrderResult> {
    const accessToken = await this.getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          description: `ShopGenie AI Order ${orderId}`,
          amount: {
            currency_code: 'USD',
            value: amountUsdString,
          },
        },
      ],
      application_context: {
        brand_name: 'ShopGenie AI',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
      },
    };

    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const debugId = response.headers.get('paypal-debug-id') || undefined;

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('[PayPal Create Order Error]', { status: response.status, debugId, errBody });
      throw new Error(`Failed to create PayPal order: ${errBody?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
    };
  }

  static async captureOrder(paypalOrderId: string, idempotencyKey: string): Promise<PayPalCaptureResult> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${this.getBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': idempotencyKey, // Crucial idempotency header (SEC-5)
      },
    });

    const debugId = response.headers.get('paypal-debug-id') || undefined;
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[PayPal Capture Error]', { status: response.status, debugId, data });
      throw new Error(data?.message || `PayPal capture failed with HTTP ${response.status}`);
    }

    // Extract captured unit details
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = capture?.id;
    const status = data.status || capture?.status || 'UNKNOWN';
    const amount = capture?.amount?.value || '0.00';
    const currency = capture?.amount?.currency_code || 'USD';

    return {
      id: data.id,
      status,
      captureId,
      amount,
      currency,
      debugId,
    };
  }
}

