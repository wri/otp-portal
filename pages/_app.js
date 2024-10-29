import React from 'react';
import { Provider } from 'react-redux';
import App from 'next/app';
import Router from 'next/router';
import withRedux from 'next-redux-wrapper'; // eslint-disable-line import/extensions
import { IntlProvider } from 'react-intl';

import 'globalthis/auto';

import { setUser } from 'modules/user';
import { setLanguage } from 'modules/language';
import { getCountries } from 'modules/countries';
import { getOperators } from 'modules/operators';

import HotJar from 'components/layout/hotjar';
import GoogleTagManager from 'components/layout/google-tag-manager';
import PageViewTracking from 'components/layout/pageview-tracking';

import Error from 'pages/_error';

import { getSession } from 'services/session';
import { makeStore } from 'store';

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

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { asPath, pathname, query, isServer, req, res, store, locale, defaultLocale } = ctx;
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
    const messages = await import(`lang/${languageFile}.json`);

    await loadLocales[language]();

    if (!isServer) {
      const { reducer: toastrReducer } = await import('react-redux-toastr');
      store.injectReducer('toastr', toastrReducer);
    }

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
  }

  componentDidMount() {
    const { store } = this.props;
    const state = store.getState();

    if (!state.operators.data.length) {
      store.dispatch(getOperators());
    }
    if (!state.countries.data.length) {
      store.dispatch(getCountries());
    }
  }

  render() {
    const { Component, pageProps, store, defaultLocale, language, messages, url } = this.props;

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

}

export default withRedux(makeStore)(MyApp);
