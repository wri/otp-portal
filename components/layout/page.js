import React from 'react';

import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { getOperators } from 'modules/operators';

export default class Page extends React.Component {
  static async getInitialProps({ req, asPath, pathname, query, store, isServer }) {
    const url = { asPath, pathname, query };
    let user = null;

    if (isServer) {
      user = req.session ? req.session.user : {};
    } else {
      user = store.getState().user;
    }

    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));
    await store.dispatch(getOperators());

    return { isServer, url };
  }
}
