import React from 'react';
import { Provider } from 'react-redux';
import App from 'next/app';
import Error from 'next/error';
import Router from 'next/router';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import withRedux from 'next-redux-wrapper'; // eslint-disable-line import/extensions

import * as reducers from 'modules';

import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { setLanguage } from 'modules/language';
import { getCountries } from 'modules/countries';
import { getOperators } from 'modules/operators';

import GoogleTagManager from 'components/layout/google-tag-manager';
import PageViewTracking from 'components/layout/pageview-tracking';

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

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { asPath, pathname, query, isServer, req, res, store } = ctx;
    const state = store.getState();
    const url = { asPath, pathname, query };
    let user = null;
    let lang = 'en';

    if (isServer) {
      lang = req.locale.language;
      user = req.session ? req.session.user : {};
    } else {
      lang = state.language;
      user = state.user;
    }

    store.dispatch(setLanguage(lang));
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

    return { pageProps };
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
    const { Component, pageProps, store } = this.props;

    if (pageProps.errorCode) {
      return <Error statusCode={pageProps.errorCode} />;
    }

    return (
      <Provider store={store}>
        <>
          <GoogleTagManager />
          <PageViewTracking />
          <Component {...pageProps} />
        </>
      </Provider>
    );
  }

}

export default withRedux(makeStore)(MyApp);
