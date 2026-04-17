/**
 * ChatToSales — Centralised API configuration
 *
 * All API modules read tenant identity and connection settings from here
 * so call-sites never have to pass a tenantId parameter manually.
 */

/** Backend base URL — no trailing slash. */
export const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
);

/** Shared route prefix for all v1 endpoints. */
export const API_BASE = '/api/v1';

/** Hard abort any request that exceeds this duration (ms). */
export const DEFAULT_TIMEOUT_MS = 10_000;
