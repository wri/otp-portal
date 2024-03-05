import React from 'react';
import { Provider } from 'react-redux';
import App from 'next/app';
import Error from 'next/error';
import Router from 'next/router';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import withRedux from 'next-redux-wrapper'; // eslint-disable-line import/extensions
import { IntlProvider } from 'react-intl';

import 'globalthis/auto';

import * as reducers from 'modules';

import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { setLanguage } from 'modules/language';
import { getCountries } from 'modules/countries';
import { getOperators } from 'modules/operators';

import GoogleTagManager from 'components/layout/google-tag-manager';
import PageViewTracking from 'components/layout/pageview-tracking';
import Osano from 'components/layout/osano';

import { getCookie, setCookie, deleteCookie } from 'services/cookies';

import 'dayjs/locale/fr';
import 'dayjs/locale/pt';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import 'dayjs/locale/vi';
import 'dayjs/locale/zh-cn';

import 'css/index.scss';

const reducer = combineReducers({
  ...reducers
});

const makeStore = (initialState = {}) =>
  createStore(
    reducer,
    initialState,
    compose(
      applyMiddleware(thunk),
      /* Redux dev tool, install chrome extension in
       * https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en */
      typeof window === 'object' &&
        typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
    )
  );

const cookieMigration = () => {
  if (getCookie('NEXT_LOCALE')) return;
  if (!getCookie('language')) return;
  if (localStorage.getItem('languageCookieMigration')) return;

  const lang = getCookie('language');
  const oldToNew = {
    'en-GB': 'en',
    'fr-FR': 'fr',
    'zh-CN': 'zh',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'vi-VN': 'vi',
    'pt-PT': 'pt'
  }
  const newLanguageCode = oldToNew[lang];
  if (!newLanguageCode) return;

  setCookie('NEXT_LOCALE', newLanguageCode, 365);
  deleteCookie('language');
  localStorage.setItem('languageCookieMigration', true);
  if (window.location.pathname === '/') {
    window.location.reload();
  }
}

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { asPath, pathname, query, isServer, req, res, store, locale, defaultLocale } = ctx;
    const state = store.getState();
    const url = { asPath, pathname, query };
    let user = null;
    let language = locale || 'en';

    if (isServer) {
      user = req.session ? req.session.user : {};
    } else {
      user = state.user;
    }

    let languageFile = language === 'zh' ? 'zh_CN' : language;
    if (process.env.CI_SERVER === 'true') {
      languageFile = 'zu';
    }
    const messages = await import(`lang/${languageFile}.json`);

    store.dispatch(setLanguage(language));
    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));

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
        res.writeHead(301, { Location: pageProps.redirectTo });
        res.end();
      } else {
        Router.replace(pageProps.redirectTo);
      }
    }

    return { pageProps, language, messages, defaultLocale };
  }

  componentDidMount() {
    const { store } = this.props;
    const state = store.getState();

    cookieMigration();

    if (!state.operators.data.length) {
      store.dispatch(getOperators());
    }
    if (!state.countries.data.length) {
      store.dispatch(getCountries());
    }
  }

  render() {
    const { Component, pageProps, store, defaultLocale, language, messages } = this.props;

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
            <Osano />
            <GoogleTagManager />
            <PageViewTracking />
            <Component {...pageProps} language={language} />
          </>
        </Provider>
      </IntlProvider>
    );
  }

}

export default withRedux(makeStore)(MyApp);
