import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { Icons } from 'vizzuality-components';

import GoogleTagManager from 'components/layout/google-tag-manager';

class MyDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context);
    const { locale } = context;
    const language = locale || 'en';
    return { ...initialProps, language };
  }

  render() {
    return (
      <Html lang={this.props.language}>
        <Head />
        <body>
          <GoogleTagManager noscript />
          <Main />
          <NextScript />
          <Icons />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
