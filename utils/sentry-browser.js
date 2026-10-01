// The only parts of the Sentry SDK the browser uses. utils/sentry.js loads this module instead of
// the whole '@sentry/nextjs' namespace, so the bundler can drop everything else the SDK ships
// (Session Replay, the Feedback widget, ...). Add a name here before using it through the loader.
export {
  init,
  captureException,
  captureRouterTransitionStart,
  captureUnderscoreErrorException
} from '@sentry/nextjs';
