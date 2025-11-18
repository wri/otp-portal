import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import Router from 'next/router';
import { IntlProvider } from 'react-intl';

import { setUser, setUserAgent } from 'modules/user';
import { setLanguage } from 'modules/language';
import { getCountries } from 'modules/countries';
import { getOperators } from 'modules/operators';

import HotJar from 'components/layout/hotjar';
import GoogleTagManager from 'components/layout/google-tag-manager';
import PageViewTracking from 'components/layout/pageview-tracking';

import Error from 'pages/_error';

import { getSession } from 'services/session';
import wrapper from 'store';

import 'css/index.scss';
import { WebVitalsTracking } from '~/components/layout/web-vitals-tracking';

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
  // const langFolder = process.env.NODE_ENV === 'production' ? 'compiled/' : '';
  const langFolder = '';
  translations = {
    en: require(`lang/${langFolder}en.json`),
    es: require(`lang/${langFolder}es.json`),
    fr: require(`lang/${langFolder}fr.json`),
    pt: require(`lang/${langFolder}pt.json`),
    ja: require(`lang/${langFolder}ja.json`),
    ko: require(`lang/${langFolder}ko.json`),
    vi: require(`lang/${langFolder}vi.json`),
    zh: require(`lang/${langFolder}zh_CN.json`)
  }
}

import dayjs from 'dayjs';
import dayOfYearPlugin from 'dayjs/plugin/dayOfYear';

import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh-cn';

dayjs.extend(dayOfYearPlugin);

const IGNORE_WARNINGS = [
  /Support for defaultProps will be removed from function components in a future major release/
];
const consoleError = console.error;
console.error = (...args) => {
  const text = args[0];
  if (IGNORE_WARNINGS.some(w => w.test(text))) return;
  consoleError(...args);
};
if (process.env.NODE_ENV !== 'production') {
  console.error("Application is ignoring warnings:", IGNORE_WARNINGS);
}

const MyApp = ({ Component, ...rest }) => {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps, defaultLocale, language } = props;
  // OTP_PORTAL_TRANSLATIONS is a global variable set in script loaded in _document.js
  const messages = translations ? translations[language] : window.OTP_PORTAL_TRANSLATIONS;

  if (!messages) { throw new Error(`No translations found for language ${language}`); }

  useEffect(() => {
    if (!pageProps.statusCode) {
      store.dispatch(getOperators());
      store.dispatch(getCountries());
    }
  }, [pageProps.statusCode]);

  useEffect(() => {
    // Lazy load Sentry integrations
    if (typeof window !== 'undefined' && window.Sentry) {
      import('@sentry/nextjs')
        .then(({
          getCurrentScope,
          httpClientIntegration,
          linkedErrorsIntegration,
          contextLinesIntegration,
          captureConsoleIntegration,
          dedupeIntegration,
          extraErrorDataIntegration,
          browserProfilingIntegration
        }) => {
          const client = getCurrentScope().getClient();
          if (client) {
            client.addIntegration(httpClientIntegration());
            client.addIntegration(linkedErrorsIntegration());
            client.addIntegration(contextLinesIntegration({ lines: 5 }));
            client.addIntegration(captureConsoleIntegration({
              levels: ['error']
            }));
            client.addIntegration(dedupeIntegration());
            client.addIntegration(extraErrorDataIntegration());
            client.addIntegration(browserProfilingIntegration());
          }
        });
    }
  }, []);

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
      <Provider store={store}>
        <>
          <WebVitalsTracking />
          <GoogleTagManager />
          <HotJar />
          <PageViewTracking />
          <Component {...pageProps} language={language} />
        </>
      </Provider>
    </IntlProvider>
  );
}

MyApp.getInitialProps = wrapper.getInitialAppProps(store => async ({ Component, ctx }) => {
  const { req, res, locale, defaultLocale } = ctx;
  const isServer = !!req;
  const state = store.getState();
  let user = null;
  let language = locale || 'en';

  if (isServer) {
    const session = await getSession(req, res);
    user = session.user;

    const UAParser = (await import('ua-parser-js')).UAParser;
    const { ua, device } = UAParser(req.headers['user-agent']);
    const userAgent = {
      ua,
      isMobile: device.is('mobile')
    }
    store.dispatch(setUserAgent(userAgent));
  } else {
    user = state.user;
  }

  store.dispatch(setLanguage(language));
  store.dispatch(setUser(user));

  const pageProps = Component.getInitialProps ?
    await Component.getInitialProps(ctx) :
    {};

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

  return { pageProps, language, defaultLocale };
});

export default MyApp;
