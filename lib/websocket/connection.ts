/**
 * Module-level singleton — one WebSocketClient instance for the entire app.
 * Import `wsConnection` wherever you need to connect, send, or subscribe.
 *
 * Usage:
 *   import { wsConnection } from '@/lib/websocket/connection';
 *
 *   // Connect once (e.g. in a top-level provider)
 *   wsConnection.connect('tenant-abc');
 *
 *   // Subscribe to a message type
 *   const unsubscribe = wsConnection.onMessage('order.created', (msg) => {
 *     console.log(msg.payload);
 *   });
 *
 *   // Clean up
 *   unsubscribe();
 *   wsConnection.disconnect();
 */

import { WebSocketClient } from './client';

export const wsConnection = new WebSocketClient();
