import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';

import GoogleTagManager from 'components/layout/google-tag-manager';

class MyDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context);
    const { locale } = context;
    const language = locale || 'en';

    return { ...initialProps, language };
  }

  render() {
    const { language } = this.props;
    const withOsano = !!process.env.OSANO_ID;
    const withGTM = !!process.env.GOOGLE_TAG_MANAGER_KEY;
    const withHotjar = process.env.DISABLE_HOTJAR !== 'true' && process.env.ENV === 'production';

    return (
      <Html lang={language}>
        <Head>
          {withOsano && <link rel="preconnect" href="https://cmp.osano.com" />}
          {withGTM && <link rel="preconnect" href="https://www.googletagmanager.com" />}
          {withHotjar && <link rel="preconnect" href="https://static.hotjar.com" />}
        </Head>
        <body>
          {withOsano && <Script src={`https://cmp.osano.com/${process.env.OSANO_ID}/osano.js`} strategy="beforeInteractive" />}
          <Script src={`/${language === 'en' ? '' : language + '/'}translations.js`} strategy="beforeInteractive" />
          <GoogleTagManager noscript />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
