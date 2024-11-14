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
  const { pageProps, defaultLocale, language, messages, url } = props;

  useEffect(async () => {
    const state = store.getState();

    if (!state.operators.data.length) {
      store.dispatch(getOperators());
    }
    if (!state.countries.data.length) {
      store.dispatch(getCountries());
    }

    // TODO: maybe move this to dedicated component that would load toastr with its reducer
    const { reducer: toastrReducer } = await import('react-redux-toastr');
    store.injectReducer('toastr', toastrReducer);
  }, []);

  if (pageProps.errorCode) {
    return <Error statusCode={pageProps.errorCode} url={url} />;
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
  const { asPath, pathname, query, req, res, locale, defaultLocale } = ctx;
  const isServer = !!req;
  const state = store.getState();
  const url = { asPath, pathname, query };
  let user = null;
  let language = locale || 'en';

  if (isServer) {
    const session = await getSession(req, res);
    user = session.user;
  } else {
    user = state.user;
  }

  const languageFile = language === 'zh' ? 'zh_CN' : language;
  // for production env use precompiled language json files (see formatjs compile)
  const languageFolder = process.env.NODE_ENV === "production" ? 'compiled/' : '';
  const messages = await import(`lang/${languageFolder}${languageFile}.json`);

  await loadLocales[language]();

  store.dispatch(setLanguage(language));
  store.dispatch(setUser(user));

  const requests = []
  if (!isServer) {
    if (!state.operators.data.length) {
      requests.push(store.dispatch(getOperators()));
    }
    if (!state.countries.data.length) {
      requests.push(store.dispatch(getCountries()));
    }
  }
  await Promise.all(requests);

  const pageProps = Component.getInitialProps ?
    await Component.getInitialProps({ ...ctx, url }) :
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

  return { pageProps, language, messages, defaultLocale, url };
});

export default MyApp;
