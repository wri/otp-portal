import React from 'react';

export default class Page extends React.Component {

  static async getInitialProps({ req, store }) {
    // store.dispatch({ type: 'SET_USER', payload: req.cookies.user });
    return {

    };
  }
}
