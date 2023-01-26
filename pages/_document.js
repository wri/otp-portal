import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

import { Icons } from 'vizzuality-components';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
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
