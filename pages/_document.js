import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import path from 'path';
import fs from 'fs';
import dropcss from 'dropcss';

import GoogleTagManager from 'components/layout/google-tag-manager';

const isCriticalCssEnabled = process.env.NODE_ENV === 'production' && process.env.CRITICAL_CSS === 'true';

class CustomHead extends Head {
  constructor(...args) {
    super(...args);
    if (isCriticalCssEnabled) {
      this.context.optimizeCss = true;
    }
  }

  getCssLinks(files) {
    const links = super.getCssLinks(files);
    if (links && links.length && isCriticalCssEnabled) {
      links.forEach((link) => {
        link.props.media = 'print';
      });
      links.push(
        <script dangerouslySetInnerHTML={{ __html:`
              document.querySelectorAll('link[media="print"]').forEach(link => {
                link.onload = function() { this.media = 'all'; }
              });
            `}} />
      )
    }

    return links;
  }
}

export default function CustomDocument({ locale, criticalCss }) {
  const withOsano = !!process.env.OSANO_ID;
  const withGTM = !!process.env.GOOGLE_TAG_MANAGER_KEY;
  const withHotjar = process.env.DISABLE_HOTJAR !== 'true' && process.env.ENV === 'production';
  const language = locale || 'en';

  return (
    <Html lang={language}>
      <CustomHead>
        {withOsano && <link rel="preconnect" href="https://cmp.osano.com" />}
        {withGTM && <link rel="preconnect" href="https://www.googletagmanager.com" />}
        {withHotjar && <link rel="preconnect" href="https://static.hotjar.com" />}

        {criticalCss && <style dangerouslySetInnerHTML={{ __html: criticalCss }} />}
      </CustomHead>
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

CustomDocument.getInitialProps = async (ctx) => {
  const initialProps = await Document.getInitialProps(ctx);

  let criticalCss = null;

  if (isCriticalCssEnabled) {
    const cssDirPath = path.resolve(process.cwd(), '.next/static/css'); // Path to the CSS directory
    const cssFiles = fs.readdirSync(cssDirPath).filter(file => file.endsWith('.css'));

    if (cssFiles.length > 0) {
      // Get the first CSS file
      const cssFilePath = path.join(cssDirPath, cssFiles[0]);
      const css = fs.readFileSync(cssFilePath, 'utf8');

      const html = `
        <html>
          <body>
            ${initialProps.html}
          </body>
        </html>
      `;
      const label = `generating critical CSS for ${ctx.pathname}`;
      console.time(label);
      criticalCss = dropcss({
        css,
        html
      }).css;
      console.timeEnd(label);
    }
  }

  return { ...initialProps, criticalCss };
};
