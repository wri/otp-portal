import React from 'react';
import PropTypes from 'prop-types';
import HeadNext from 'next/head';
import { useRouter } from 'next/router';

const Head = ({ title, description }) => {
  const { locales, asPath } = useRouter();
  const fullTitle = `${title} | Open Timber Portal`;

  return (
    <HeadNext>
      <title>{fullTitle}</title>
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
      {/* TODO: use next/script for all scripts across app */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      {/* {process.env.GOOGLE_API_KEY && (
        <script src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_API_KEY}&libraries=places`} defer />
      )} */}
    </HeadNext>
  );
}

Head.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

export default Head;
