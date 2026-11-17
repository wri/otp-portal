import React, { useEffect, useMemo, useState } from 'react';
import Router from 'next/router';
import { IntlProvider } from 'react-intl';

import { UserContext, getClientUser, setClientUser } from 'contexts/user';

import HotJar from 'components/layout/hotjar';
import GoogleTagManager from 'components/layout/google-tag-manager';
import PageViewTracking from 'components/layout/pageview-tracking';

import Error from 'pages/_error';

import API, { setUnauthorizedHandler } from 'services/api';
import { track } from 'services/server-timing';
import { getCookie } from 'services/cookies';

import 'css/index.scss';
import { WebVitalsTracking } from '~/components/layout/web-vitals-tracking';
import { IconSymbols } from 'components/ui/icon';

let translations;
// Here is some magic to not pass translations in page props as that is significantly increasing the size of the initial page load of every page.
// We also don't want to bundle all translation files in the client bundle
// so the only way is to load all translations on the server side, and on the client we will
// use the translations that are already loaded in the window TRANSLATIONS object in _document page.
// NOT SURE IF THAT WORKS with server static generation but WE DON'T USE IT!
// also doing:
// const isServer = typeof window === 'undefined'
// if (isServer) { ... }
// DOES NOT WORK because required files ends up in the client bundle anyway. Dunno why
if (typeof window === 'undefined') {
  translations = require('utils/translations').translations;
}

// The API issues bare cookie names because the portal sends no ?app= param
// (see the API's APIController#auth_cookie_name).
const AUTH_COOKIE_NAME = 'otp_auth_token';

const IGNORE_WARNINGS = [
  /`legacyBehavior` is deprecated and will be removed in a future release. A codemod is available to upgrade your components:/
];
const consoleError = console.error;
console.error = (...args) => {
  const text = args[0];
  if (typeof text !== 'string') { consoleError(...args); return; }
  if (IGNORE_WARNINGS.some(w => (typeof w === 'function' ? w(...args) : w.test(text)))) return;
  consoleError(...args);
};
if (process.env.NODE_ENV !== 'production') {
  console.info('Application is ignoring warnings:', IGNORE_WARNINGS.map(w => (typeof w === 'function' ? w.name : w.source)));
}

const MyApp = ({ Component, pageProps, defaultLocale, language, user: initialUser }) => {
  // OTP_PORTAL_TRANSLATIONS is a global variable set in script loaded in _document.js
  const messages = translations ? translations[language] : window.OTP_PORTAL_TRANSLATIONS;

  if (!messages) { throw new Error(`No translations found for language ${language}`); }
  // login and logout reload the page, so only a 401 changes the user after the server set it
  const [user, setUser] = useState(initialUser || {});
  const userContext = useMemo(() => ({ user, setUser }), [user]);

  useEffect(() => {
    setClientUser(user);
  }, [user]);

  // Reconcile stale auth when the session cookie expires mid-session. A client
  // request returning 401 means we're no longer authenticated even though the
  // user state still says we are. Clearing it gives logged-out chrome, and
  // the protected pages redirect off their own getInitialProps on the next
  // navigation - no reload, which against a cached current-user would just loop.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (user.user_id) setUser({});
    });
    return () => setUnauthorizedHandler(null);
  }, [user]);

  // useEffect(() => {
  //   // Lazy load Sentry integrations
  //   if (typeof window !== 'undefined') {
  //     import('@sentry/nextjs')
  //       .then(({
  //         getCurrentScope,
  //         httpClientIntegration,
  //         linkedErrorsIntegration,
  //         contextLinesIntegration,
  //         captureConsoleIntegration,
  //         dedupeIntegration,
  //         extraErrorDataIntegration,
  //         browserProfilingIntegration
  //       }) => {
  //         const client = getCurrentScope().getClient();
  //         if (client) {
  //           client.addIntegration(httpClientIntegration());
  //           client.addIntegration(linkedErrorsIntegration());
  //           client.addIntegration(contextLinesIntegration({ lines: 5 }));
  //           client.addIntegration(captureConsoleIntegration({
  //             levels: ['error']
  //           }));
  //           client.addIntegration(dedupeIntegration());
  //           client.addIntegration(extraErrorDataIntegration());
  //           client.addIntegration(browserProfilingIntegration());
  //         }
  //       });
  //   }
  // }, []);

  if (pageProps.statusCode) {
    return <Error statusCode={pageProps.statusCode} />;
  }

  return (
    <IntlProvider
      locale={language}
      messages={messages}
      textComponent="span"
      defaultLocale={defaultLocale}
    >
      <UserContext.Provider value={userContext}>
        <WebVitalsTracking />
        <GoogleTagManager />
        <HotJar />
        <PageViewTracking />
        <IconSymbols />
        <Component {...pageProps} language={language} />
      </UserContext.Provider>
    </IntlProvider>
  );
}

MyApp.getInitialProps = async ({ Component, ctx }) => {
  const { req, res, locale, defaultLocale } = ctx;
  const isServer = !!req;
  const language = locale || 'en';

  const run = async () => {
    let user = null;

    if (isServer) {
      // Only the auth cookie can mean a session. Gating on any cookie made every
      // visitor carrying _ga/_hj/Osano pay a blocking current-user request.
      const authToken = getCookie(AUTH_COOKIE_NAME, req.headers.cookie);

      const doneAuth = track(req, 'auth');
      if (authToken) {
        const { getCachedUser, setCachedUser } = require('services/current-user-cache');
        const cached = getCachedUser(authToken);
        if (cached !== undefined) {
          user = cached;
        } else {
          try {
            const { data } = await API.get('users/current-user', {}, { cookie: req.headers.cookie });
            user = {
              user_id: data.id,
              country: data['country-id'],
              observer: data['observer-id'],
              operator_ids: data['operator-ids'] || [],
              role: data['user-permission'] && data['user-permission']['user-role'] || 'user'
            };
          } catch (err) {
            user = null;
          }
          setCachedUser(authToken, user);
        }
      }
      doneAuth();
    } else {
      user = getClientUser();
    }

    const { token, ...safeUser } = user || {};

    // pages read these from ctx
    ctx.language = language;
    ctx.user = safeUser;

    const donePage = track(req, 'page');
    const pageProps = Component.getInitialProps ?
      await Component.getInitialProps(ctx) :
      {};
    donePage();

    if (pageProps.statusCode && isServer) {
      res.statusCode = pageProps.statusCode;
    }
    if (pageProps.redirectTo) {
      if (isServer) {
        const localePrefix = locale === defaultLocale || pageProps.redirectTo.startsWith('/' + locale) ? '' : '/' + locale;
        let redirectPermanent = true;
        if (pageProps.redirectPermanent == false) {
          redirectPermanent = false;
        }
        res.writeHead(redirectPermanent ? 301 : 302, { Location: localePrefix + pageProps.redirectTo });
        res.end();
      } else {
        Router.replace(pageProps.redirectTo);
      }
      return {};
    }

    return { pageProps, language, defaultLocale, user: safeUser };
  };

  if (typeof window === 'undefined') {
    const { runWithRequest } = require('services/request-context');
    return runWithRequest(req?.headers, run);
  }
  return run();
};

export default MyApp;
