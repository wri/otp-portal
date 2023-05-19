import React from 'react';
import PropTypes from 'prop-types';
import Script from 'next/script';

const GoogleTagManager = ({ noscript }) => {
  const gtmKey = process.env.GOOGLE_TAG_MANAGER_KEY;

  if (!gtmKey) return null;

  if (noscript) {
    return (
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${process.env.GOOGLE_TAG_MANAGER_KEY}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        ></iframe>
      </noscript>
    )
  }

  return (
    <Script
      id="google-tag-manager"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${process.env.GOOGLE_TAG_MANAGER_KEY}');
        `
      }}
    />
  )
}

GoogleTagManager.defaultProps = {
  noscript: false
};

GoogleTagManager.propTypes = {
  noscript: PropTypes.bool
}

export default GoogleTagManager;
