import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

import { Icons } from 'vizzuality-components';

class MyDocument extends Document {
  static async getInitialProps(context) {
    const initialProps = await Document.getInitialProps(context);
    const { req } = context;
    const language = (req && req?.locale?.language) || 'en';
    return { ...initialProps, language };
  }

  render() {
    return (
      <Html lang={this.props.language}>
        <Head />
        <body>
          <Main />
          <NextScript />
          <Icons />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
