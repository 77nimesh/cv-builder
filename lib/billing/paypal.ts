import type { Plan } from "@prisma/client";

export class PayPalApiError extends Error {
  status: number;
  details: unknown;

  constructor(input: { message: string; status: number; details?: unknown }) {
    super(input.message);
    this.name = "PayPalApiError";
    this.status = input.status;
    this.details = input.details;
  }
}

export type PayPalEnvironment = "sandbox" | "live";

export type PayPalLink = {
  href: string;
  rel: string;
  method?: string;
};

export type PayPalOrderResponse = {
  id?: string;
  status?: string;
  links?: PayPalLink[];
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: PayPalCapture[];
    };
  }>;
  payer?: {
    payer_id?: string;
    email_address?: string;
  };
};

export type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: {
    currency_code?: string;
    value?: string;
  };
};

type PayPalAccessTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
};

function getPayPalEnvironment(): PayPalEnvironment {
  return process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
}

function getPayPalBaseUrl() {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error(
      "PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be configured."
    );
  }

  return {
    clientId,
    clientSecret,
  };
}

function getPayPalBrandName() {
  return process.env.PAYPAL_BRAND_NAME?.trim() || "Resume Builder";
}

async function parsePayPalResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  const data = (await parsePayPalResponse(
    response
  )) as PayPalAccessTokenResponse | null;

  if (!response.ok || !data?.access_token) {
    throw new PayPalApiError({
      message: "Failed to obtain PayPal access token.",
      status: response.status,
      details: data,
    });
  }

  return data.access_token;
}

async function paypalFetch<T>(
  pathname: string,
  init: RequestInit & { idempotencyKey?: string } = {}
): Promise<T> {
  const accessToken = await getPayPalAccessToken();

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Content-Type", "application/json");

  if (init.idempotencyKey) {
    headers.set("PayPal-Request-Id", init.idempotencyKey);
  }

  const response = await fetch(`${getPayPalBaseUrl()}${pathname}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = await parsePayPalResponse(response);

  if (!response.ok) {
    throw new PayPalApiError({
      message: `PayPal request failed: ${pathname}`,
      status: response.status,
      details: data,
    });
  }

  return data as T;
}

export function formatPayPalAmount(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

export function paypalAmountValueToCents(value: string) {
  const normalized = value.trim();

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error(`Invalid PayPal amount value: ${value}`);
  }

  const [dollars, cents = ""] = normalized.split(".");
  return Number(dollars) * 100 + Number(cents.padEnd(2, "0").slice(0, 2));
}

export function findPayPalApprovalUrl(order: PayPalOrderResponse) {
  return (
    order.links?.find((link) => link.rel === "approve")?.href ??
    order.links?.find((link) => link.rel === "payer-action")?.href ??
    null
  );
}

export function findCompletedPayPalCapture(order: PayPalOrderResponse) {
  for (const purchaseUnit of order.purchase_units ?? []) {
    for (const capture of purchaseUnit.payments?.captures ?? []) {
      if (capture.status === "COMPLETED") {
        return capture;
      }
    }
  }

  return null;
}

export async function createPayPalOrder(input: {
  paymentId: string;
  idempotencyKey: string;
  plan: Pick<
    Plan,
    "code" | "name" | "description" | "amountCents" | "currency"
  >;
  returnUrl: string;
  cancelUrl: string;
}) {
  const order = await paypalFetch<PayPalOrderResponse>(
    "/v2/checkout/orders",
    {
      method: "POST",
      idempotencyKey: input.idempotencyKey,
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.paymentId,
            custom_id: input.paymentId,
            description: input.plan.name,
            amount: {
              currency_code: input.plan.currency,
              value: formatPayPalAmount(input.plan.amountCents),
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: getPayPalBrandName(),
              landing_page: "LOGIN",
              user_action: "PAY_NOW",
              return_url: input.returnUrl,
              cancel_url: input.cancelUrl,
            },
          },
        },
      }),
    }
  );

  if (!order.id) {
    throw new PayPalApiError({
      message: "PayPal order was created without an order id.",
      status: 502,
      details: order,
    });
  }

  return order;
}

export async function capturePayPalOrder(input: {
  providerOrderId: string;
  idempotencyKey: string;
}) {
  return paypalFetch<PayPalOrderResponse>(
    `/v2/checkout/orders/${encodeURIComponent(input.providerOrderId)}/capture`,
    {
      method: "POST",
      idempotencyKey: input.idempotencyKey,
      body: JSON.stringify({}),
    }
  );
}