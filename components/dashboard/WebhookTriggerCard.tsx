'use client';

import { useState } from 'react';
import { webhookApi, type WebhookEvent } from '@/lib/api';
import { ApiError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const EVENTS: WebhookEvent[] = [
  'order.created',
  'order.paid',
  'conversation.started',
  'payment.received',
];

export function WebhookTriggerCard() {
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent>('order.created');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseId, setResponseId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleTrigger() {
    setStatus('loading');
    setErrorMsg(null);
    setResponseId(null);

    try {
      const res = await webhookApi.trigger({
        event: selectedEvent,
        payload: { source: 'dashboard', triggeredAt: new Date().toISOString() },
      });
      setResponseId(res.id);
      setStatus('success');
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.body.message
          : err instanceof Error
            ? err.message
            : 'Unknown error';
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  return (
    <Card>
      <CardHeader title="Webhook Tester" description="Fire a test event to the backend" />
      <CardBody>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="webhook-event" className="text-sm font-medium text-gray-700">
              Event
            </label>
            <select
              id="webhook-event"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as WebhookEvent)}
              className="h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </div>

          <Button
            className="w-full"
            onClick={handleTrigger}
            loading={status === 'loading'}
            disabled={status === 'loading'}
          >
            Trigger Event
          </Button>
        </div>
      </CardBody>

      {status !== 'idle' && (
        <CardFooter>
          {status === 'success' && (
            <div className="flex items-center gap-2">
              <Badge variant="success" dot>
                Delivered
              </Badge>
              <span className="text-xs text-gray-500 font-mono truncate">{responseId}</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2">
              <Badge variant="danger" dot>
                Failed
              </Badge>
              <span className="text-xs text-red-600">{errorMsg}</span>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
