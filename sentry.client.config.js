// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { BrowserClient, makeFetchTransport, defaultStackParser, getCurrentScope } from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  // To only use what we need and keep the bundle size smaller
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/tree-shaking/
  const client = new BrowserClient({
    debug: false,
    dsn: SENTRY_DSN,
    integrations: [],
    tracesSampleRate: 0,
    environment: process.env.ENV,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications.',
      'ResizeObserver is not defined',
      "Can't find variable: ResizeObserver",
      "Could not load image blob:"
    ],
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
  });

  getCurrentScope().setClient(client);
  client.init();
}
