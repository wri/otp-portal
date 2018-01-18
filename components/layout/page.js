import React from 'react';

import { setRouter } from 'modules/router';

export default class Page extends React.Component {
  static async getInitialProps({ asPath, pathname, query, store, isServer }) {
    const url = { asPath, pathname, query };
    store.dispatch(setRouter(url));
    return { isServer, url };
  }
}
