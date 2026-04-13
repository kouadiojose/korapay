import db from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { generateWebhookSecret, signWebhookPayload } from '../../utils/crypto';
import type { CreateWebhookInput, UpdateWebhookInput } from './webhook.schema';

async function getMerchantByUserId(userId: string) {
  const merchant = await db('merchants').where('user_id', userId).first();
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }
  return merchant;
}

export async function createWebhook(userId: string, input: CreateWebhookInput) {
  const merchant = await getMerchantByUserId(userId);

  const secret = generateWebhookSecret();

  const [webhook] = await db('webhooks')
    .insert({
      merchant_id: merchant.id,
      url: input.url,
      events: JSON.stringify(input.events),
      secret,
    })
    .returning('*');

  return {
    ...webhook,
    secret, // Only returned at creation
  };
}

export async function listWebhooks(userId: string) {
  const merchant = await getMerchantByUserId(userId);

  const webhooks = await db('webhooks')
    .select('id', 'url', 'events', 'is_active', 'created_at', 'updated_at')
    .where('merchant_id', merchant.id)
    .orderBy('created_at', 'desc');

  return webhooks;
}

export async function updateWebhook(userId: string, webhookId: string, input: UpdateWebhookInput) {
  const merchant = await getMerchantByUserId(userId);

  const webhook = await db('webhooks')
    .where('id', webhookId)
    .where('merchant_id', merchant.id)
    .first();

  if (!webhook) {
    throw new NotFoundError('Webhook not found');
  }

  const updateData: Record<string, unknown> = { updated_at: new Date() };
  if (input.url !== undefined) updateData.url = input.url;
  if (input.events !== undefined) updateData.events = JSON.stringify(input.events);
  if (input.is_active !== undefined) updateData.is_active = input.is_active;

  const [updated] = await db('webhooks')
    .where('id', webhookId)
    .update(updateData)
    .returning('*');

  return updated;
}

export async function deleteWebhook(userId: string, webhookId: string) {
  const merchant = await getMerchantByUserId(userId);

  const webhook = await db('webhooks')
    .where('id', webhookId)
    .where('merchant_id', merchant.id)
    .first();

  if (!webhook) {
    throw new NotFoundError('Webhook not found');
  }

  await db('webhooks').where('id', webhookId).delete();

  return { message: 'Webhook deleted successfully' };
}

export async function deliverWebhook(
  webhookId: string,
  event: string,
  payload: Record<string, unknown>,
  transactionId?: string,
) {
  const webhook = await db('webhooks').where('id', webhookId).first();
  if (!webhook || !webhook.is_active) return;

  const signature = signWebhookPayload(payload, webhook.secret);

  // Create delivery record
  const [delivery] = await db('webhook_deliveries')
    .insert({
      webhook_id: webhookId,
      transaction_id: transactionId || null,
      event,
      payload: JSON.stringify(payload),
      status: 'pending',
      attempt_count: 1,
    })
    .returning('*');

  // Attempt delivery
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': event,
        'X-Webhook-Id': delivery.id,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    await db('webhook_deliveries')
      .where('id', delivery.id)
      .update({
        response_status: response.status,
        response_body: await response.text().catch(() => ''),
        status: response.ok ? 'delivered' : 'failed',
        delivered_at: response.ok ? new Date() : null,
        next_retry_at: response.ok ? null : new Date(Date.now() + 60000), // Retry in 1 min
      });
  } catch (err) {
    await db('webhook_deliveries')
      .where('id', delivery.id)
      .update({
        response_body: (err as Error).message,
        status: 'failed',
        next_retry_at: new Date(Date.now() + 60000),
      });
  }
}

export async function deliverWebhookForTransaction(
  merchantId: string,
  event: string,
  transactionId: string,
) {
  const transaction = await db('transactions').where('id', transactionId).first();
  if (!transaction) return;

  const webhooks = await db('webhooks')
    .where('merchant_id', merchantId)
    .where('is_active', true);

  const payload = {
    event,
    data: {
      reference: transaction.reference,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      fee: transaction.fee,
      payment_method: transaction.payment_method,
      customer: {
        name: transaction.customer_name,
        email: transaction.customer_email,
        phone: transaction.customer_phone,
      },
      metadata: transaction.metadata,
      completed_at: transaction.completed_at,
      created_at: transaction.created_at,
    },
  };

  for (const webhook of webhooks) {
    const events = typeof webhook.events === 'string' ? JSON.parse(webhook.events) : webhook.events;
    if (Array.isArray(events) && events.includes(event)) {
      await deliverWebhook(webhook.id, event, payload, transactionId);
    }
  }
}

export async function retryWebhookDelivery(userId: string, deliveryId: string) {
  const merchant = await getMerchantByUserId(userId);

  const delivery = await db('webhook_deliveries')
    .select('webhook_deliveries.*')
    .join('webhooks', 'webhooks.id', 'webhook_deliveries.webhook_id')
    .where('webhook_deliveries.id', deliveryId)
    .where('webhooks.merchant_id', merchant.id)
    .first();

  if (!delivery) {
    throw new NotFoundError('Webhook delivery not found');
  }

  if (delivery.attempt_count >= delivery.max_attempts) {
    await db('webhook_deliveries')
      .where('id', deliveryId)
      .update({ status: 'exhausted' });
    throw new Error('Maximum retry attempts exhausted');
  }

  const webhook = await db('webhooks').where('id', delivery.webhook_id).first();
  if (!webhook) {
    throw new NotFoundError('Webhook not found');
  }

  const payload = typeof delivery.payload === 'string' ? JSON.parse(delivery.payload) : delivery.payload;
  const signature = signWebhookPayload(payload, webhook.secret);

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event,
        'X-Webhook-Id': delivery.id,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    await db('webhook_deliveries')
      .where('id', deliveryId)
      .update({
        response_status: response.status,
        response_body: await response.text().catch(() => ''),
        status: response.ok ? 'delivered' : 'failed',
        delivered_at: response.ok ? new Date() : null,
        attempt_count: delivery.attempt_count + 1,
        next_retry_at: response.ok ? null : new Date(Date.now() + 60000 * Math.pow(2, delivery.attempt_count)),
      });

    return { retried: true, delivered: response.ok };
  } catch (err) {
    await db('webhook_deliveries')
      .where('id', deliveryId)
      .update({
        response_body: (err as Error).message,
        status: 'failed',
        attempt_count: delivery.attempt_count + 1,
        next_retry_at: new Date(Date.now() + 60000 * Math.pow(2, delivery.attempt_count)),
      });

    return { retried: true, delivered: false };
  }
}
