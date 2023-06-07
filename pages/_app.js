import React from 'react';
import { Provider } from 'react-redux';
import App from 'next/app';
import Error from 'next/error';
import Router from 'next/router';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import withRedux from 'next-redux-wrapper'; // eslint-disable-line import/extensions
import { IntlProvider } from 'react-intl';

import * as reducers from 'modules';

import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { setLanguage } from 'modules/language';
import { getCountries } from 'modules/countries';
import { getOperators } from 'modules/operators';

import GoogleTagManager from 'components/layout/google-tag-manager';
import PageViewTracking from 'components/layout/pageview-tracking';

import 'css/index.scss';

import langEn from 'lang/en.json';
import langFr from 'lang/fr.json';
import langZhCN from 'lang/zh_CN.json';
import langJa from 'lang/ja.json';
import langKo from 'lang/ko.json';
import langVi from 'lang/vi.json';
import langPt from 'lang/pt.json';

const MESSAGES = {
  en: langEn,
  fr: langFr,
  zh: langZhCN,
  ja: langJa,
  ko: langKo,
  vi: langVi,
  pt: langPt
};

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

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { asPath, pathname, query, isServer, req, store, locale, defaultLocale } = ctx;
    const state = store.getState();
    const url = { asPath, pathname, query };
    let user = null;
    let language = locale || 'en';

    if (isServer) {
      user = req.session ? req.session.user : {};
    } else {
      user = state.user;
    }

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

    return { pageProps, language, defaultLocale };
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
    const { Component, pageProps, store, defaultLocale, language } = this.props;

    if (pageProps.errorCode) {
      return <Error statusCode={pageProps.errorCode} />;
    }

    return (
      <IntlProvider
        locale={language}
        messages={MESSAGES[language]}
        textComponent="span"
        defaultLocale={defaultLocale}
      >
        <Provider store={store}>
          <>
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
