/**
 * Lazy Sentry loader.
 *
 * The browser SDK is ~55 kB gzipped and lives in main-*.js, which is the single largest
 * consumer of main-thread time on first load. Importing it dynamically keeps it out of
 * the startup path: instrumentation-client.js warms it once the page is idle, and the
 * helpers here pull it in immediately if something throws before that happens.
 *
 * Client init lives here rather than in instrumentation-client.js so that whichever of
 * those two paths runs first, the SDK is configured exactly once.
 *
 * On the server the SDK is already initialised by instrumentation.js, so we only import.
 */
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

const IGNORE_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver is not defined',
  "Can't find variable: ResizeObserver",
  'Could not load image blob:'
];

let sentryPromise = null;
let sentry = null;

export function loadSentry() {
  if (!sentryPromise) {
    sentryPromise = import('@sentry/nextjs')
      .then((mod) => {
        if (typeof window !== 'undefined' && SENTRY_DSN) {
          mod.init({
            dsn: SENTRY_DSN,
            environment: process.env.ENV,
            ignoreErrors: IGNORE_ERRORS,
            // Adjust this value in production, or use tracesSampler for greater control
            tracesSampleRate: 0.2
          });
        }

        sentry = mod;
        return mod;
      })
      .catch(() => {
        // a failed chunk load (flaky network) must not disable Sentry for the whole
        // session - drop the memo so the next capture attempt retries the import
        sentryPromise = null;
        return null;
      });
  }

  return sentryPromise;
}

/** Synchronous accessor. Null until the chunk has actually loaded. */
export function getSentry() {
  return sentry;
}

export function captureException(error, context) {
  return loadSentry().then((mod) => mod && mod.captureException(error, context));
}
