import React from 'react';
import PropTypes from 'prop-types';
import HeadNext from 'next/head';
import { useRouter } from 'next/router';

const Head = ({ title, description }) => {
  const { locales, asPath } = useRouter();

  return (
    <HeadNext>
      <title>{title} | Open Timber Portal</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="author" content="Vizzuality" />

      <link
        rel="alternate"
        hrefLang="x-default"
        href={`https://opentimberportal.org${asPath}`}
      />
      <link
        rel="alternate"
        hrefLang="en"
        href={`https://opentimberportal.org${asPath}`}
      />
      {locales.filter(l => l !== 'en').map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`https://opentimberportal.org/${locale}${asPath}`}
        />
      ))}

      {/* Favicon */}
      <link rel="apple-touch-icon" sizes="57x57" href="/static/favicon/apple-icon-57x57.png" />
      <link rel="apple-touch-icon" sizes="60x60" href="/static/favicon/apple-icon-60x60.png" />
      <link rel="apple-touch-icon" sizes="72x72" href="/static/favicon/apple-icon-72x72.png" />
      <link rel="apple-touch-icon" sizes="76x76" href="/static/favicon/apple-icon-76x76.png" />
      <link rel="apple-touch-icon" sizes="114x114" href="/static/favicon/apple-icon-114x114.png" />
      <link rel="apple-touch-icon" sizes="120x120" href="/static/favicon/apple-icon-120x120.png" />
      <link rel="apple-touch-icon" sizes="144x144" href="/static/favicon/apple-icon-144x144.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/static/favicon/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/static/favicon/apple-icon-180x180.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/static/favicon/android-icon-192x192.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="96x96" href="/static/favicon/favicon-96x96.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon/favicon-16x16.png" />
      <link rel="mask-icon" href="/static/favicon/favicon.svg" color="white" />
      <link rel="manifest" href="/static/favicon/manifest.json" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="msapplication-TileImage" content="/static/favicon/ms-icon-144x144.png" />
      <meta name="theme-color" content="#ffffff" />

      {/* Styles and scripts */}
      <script src="https://cdn.polyfill.io/v3/polyfill.min.js?version=3.110.1" />
      {process.env.GOOGLE_API_KEY && (
        <script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=places`} />
      )}
      {process.env.ENV === 'production' && !(process.env.DISABLE_HOTJAR === 'true') && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:3036814,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}}
        />
      )}
    </HeadNext>
  );
}

Head.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default Head;
