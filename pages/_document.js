import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';
import path from 'path';
import fs from 'fs';
import dropcss from 'dropcss';
import * as Sentry from '@sentry/nextjs';

import GoogleTagManager from 'components/layout/google-tag-manager';

const isCriticalCssEnabled = process.env.NODE_ENV === 'production' && process.env.CRITICAL_CSS === 'true';

// Read once, lazily. Absent in dev, where the unversioned URL is what we want anyway.
let buildId;

function getBuildId() {
  if (buildId === undefined) {
    try {
      buildId = fs.readFileSync(path.resolve(process.cwd(), '.next/BUILD_ID'), 'utf8').trim();
    } catch (e) {
      buildId = null;
    }
  }
  return buildId;
}

// /translations.js is render-blocking (beforeInteractive) because _app.js reads
// window.OTP_PORTAL_TRANSLATIONS synchronously during render, so it has to run before
// hydration. Versioning the URL by build id lets the route be cached immutably - see the
// matching Cache-Control in pages/translations.js.js, which only caches versioned requests.
function getTranslationsSrc(language) {
  const src = `/${language === 'en' ? '' : `${language}/`}translations.js`;
  const id = getBuildId();
  return id ? `${src}?v=${id}` : src;
}

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
        <script dangerouslySetInnerHTML={{
          __html: `
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
        {/*
          The @font-face lives in css/_fonts.scss, so Next has no knowledge of this font
          and won't preload it. Without this the browser only discovers it after parsing
          the stylesheet, adding a round trip to the critical path.
          crossOrigin is required even same-origin: fonts are fetched in CORS mode, and
          a preload without it is discarded and re-fetched.
        */}
        <link
          rel="preload"
          href="/static/fonts/ProximaNova-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {withOsano && <link rel="preconnect" href="https://cmp.osano.com" />}
        {withGTM && <link rel="preconnect" href="https://www.googletagmanager.com" />}
        {withHotjar && <link rel="preconnect" href="https://static.hotjar.com" />}

        {criticalCss && <style dangerouslySetInnerHTML={{ __html: criticalCss }} />}
      </CustomHead>
      <body>
        {withOsano && <Script src={`https://cmp.osano.com/${process.env.OSANO_ID}/osano.js`} strategy="beforeInteractive" />}
        <Script src={getTranslationsSrc(language)} strategy="beforeInteractive" />
        <GoogleTagManager noscript />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

function getCriticalCss(ctx, pageHtml) {
  if (!isCriticalCssEnabled) return null;
  let criticalCss = null;

  try {
    const cssDirPath = path.resolve(process.cwd(), '.next/static/css'); // Path to the CSS directory
    const cssFiles = fs.readdirSync(cssDirPath).filter(file => file.endsWith('.css'));

    if (cssFiles.length === 0) {
      console.warn('No CSS files found in the directory'); // eslint-disable-line
      return null;
    }

    // get cached critical css
    const buildId = fs.readFileSync(path.resolve(process.cwd(), '.next/BUILD_ID'), 'utf8').trim();
    const page = ctx.pathname === '/' ? 'index' : ctx.pathname.replace(/\//g, '_').replace(/^\_/, '');
    const cacheDirPath = path.resolve(process.cwd(), `.next/cache/critical-css/${buildId}`);
    const cacheFilePath = path.join(cacheDirPath, `${page}.css`);

    // checking dropcss cached
    if (!fs.existsSync(cacheDirPath)) {
      fs.mkdirSync(cacheDirPath, { recursive: true });
    }

    if (fs.existsSync(cacheFilePath)) {
      const label = `reading critical CSS for ${page} from cache`;
      const span = Sentry.startInactiveSpan({ name: 'dropCSS-cached', description: label });
      console.time(label); // eslint-disable-line
      const cachedCriticalCss = fs.readFileSync(cacheFilePath, 'utf8');
      console.timeEnd(label); // eslint-disable-line
      span.end();
      return cachedCriticalCss;
    }

    // Get the first CSS file
    const cssFilePath = path.join(cssDirPath, cssFiles[0]);
    const css = fs.readFileSync(cssFilePath, 'utf8');
    const html = `
      <html>
        <body>
          ${pageHtml}
        </body>
      </html>
      `;
    const label = `generating critical CSS for ${page}`;
    const span = Sentry.startInactiveSpan({ name: 'dropCSS', description: label });
    console.time(label); // eslint-disable-line
    criticalCss = dropcss({
      css,
      html
    }).css;
    // saving critical css
    fs.writeFileSync(cacheFilePath, criticalCss, 'utf8');
    span.end();
    console.timeEnd(label); // eslint-disable-line
  } catch (e) {
    console.error('Error generating critical CSS:', e); // eslint-disable-line
    Sentry.captureException(e);
  }

  return criticalCss;
}

CustomDocument.getInitialProps = async (ctx) => {
  const initialProps = await Document.getInitialProps(ctx);
  const criticalCss = getCriticalCss(ctx, initialProps.html);

  return { ...initialProps, criticalCss };
};
