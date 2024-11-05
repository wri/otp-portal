import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
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
          {process.env.OSANO_ID && <Script src={`https://cmp.osano.com/${process.env.OSANO_ID}/osano.js`} strategy="afterInteractive" />}
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
