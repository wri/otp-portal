// This file configures the initialization of Sentry on the browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
//
// The SDK is loaded lazily (see utils/sentry.js) to keep ~55 kB out of main-*.js and off
// the startup path. Anything thrown before it finishes loading is buffered here and
// replayed once it has, so early errors are still reported - though with less context
// than if the SDK's integrations had been installed at the time.
import { loadSentry, getSentry } from 'utils/sentry';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  // enough for any real error burst; a page erroring every frame must not grow this forever
  const MAX_BUFFERED = 50;
  const MAX_LOAD_ATTEMPTS = 3;
  const buffered = [];
  let attempts = 0;

  const buffer = (value) => {
    // cross-origin scripts fire error events with no .error and an empty message - skip those
    if (value && buffered.length < MAX_BUFFERED) buffered.push(value);
  };
  const bufferError = (event) => buffer(event.error || event.message);
  const bufferRejection = (event) => buffer(event.reason);

  window.addEventListener('error', bufferError);
  window.addEventListener('unhandledrejection', bufferRejection);

  const start = () => {
    attempts += 1;
    loadSentry().then((Sentry) => {
      if (!Sentry) {
        // chunk failed to load: keep buffering and retry on the next idle period
        if (attempts < MAX_LOAD_ATTEMPTS) {
          schedule();
        } else {
          window.removeEventListener('error', bufferError);
          window.removeEventListener('unhandledrejection', bufferRejection);
          buffered.length = 0;
        }
        return;
      }

      window.removeEventListener('error', bufferError);
      window.removeEventListener('unhandledrejection', bufferRejection);

      // these were unhandled when they happened; report them as such
      buffered.forEach((error) => Sentry.captureException(error, { mechanism: { handled: false } }));
      buffered.length = 0;
    });
  };

  // wait for the page to settle, so loading the SDK never competes with first paint
  const schedule = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(start, { timeout: 5000 });
    } else {
      window.setTimeout(start, 2000);
    }
  };

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule, { once: true });
  }
}

// No-ops until the SDK has loaded; navigation spans simply start being recorded from then on.
export const onRouterTransitionStart = (...args) => {
  const Sentry = getSentry();
  if (Sentry) Sentry.captureRouterTransitionStart(...args);
};
