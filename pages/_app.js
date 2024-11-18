import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import Router from 'next/router';
import { IntlProvider } from 'react-intl';

import { setUser } from 'modules/user';
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
  const langFolder = process.env.NODE_ENV === 'production' ? 'compiled/' : '';
  translations = {
    en: require(`lang/${langFolder}en.json`),
    fr: require(`lang/${langFolder}fr.json`),
    pt: require(`lang/${langFolder}pt.json`),
    ja: require(`lang/${langFolder}ja.json`),
    ko: require(`lang/${langFolder}ko.json`),
    vi: require(`lang/${langFolder}vi.json`),
    zh: require(`lang/${langFolder}zh_CN.json`)
  }
}

// workaround as import(`dayjs/locale/${locale}`) was not working
const loadLocales = {
  en: () => Promise.resolve(),
  fr: () => import('dayjs/locale/fr'),
  pt: () => import('dayjs/locale/pt'),
  ja: () => import('dayjs/locale/ja'),
  ko: () => import('dayjs/locale/ko'),
  vi: () => import('dayjs/locale/vi'),
  zh: () => import('dayjs/locale/zh-cn')
}

import dayjs from 'dayjs';
import dayOfYearPlugin from 'dayjs/plugin/dayOfYear';

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
    store.dispatch(getOperators());
    store.dispatch(getCountries());
  }, []);

  if (pageProps.errorCode) {
    return <Error statusCode={pageProps.errorCode} />;
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
  } else {
    user = state.user;
  }

  await loadLocales[language]();

  store.dispatch(setLanguage(language));
  store.dispatch(setUser(user));

  const pageProps = Component.getInitialProps ?
    await Component.getInitialProps(ctx) :
    {};

  if (pageProps.errorCode && isServer) {
    res.statusCode = pageProps.errorCode;
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
