import React from 'react';
import Script from 'next/script';

const Analytics = () => {
  const gaKey = process.env.GOOGLE_ANALYTICS_KEY;

  if (!gaKey) return null;

  return (
    <>
      <Script
        id="google-tag-manager"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaKey}`}
      />
      <Script
        id="google-tag-manager-init"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaKey}');
        `,
        }}
      />
    </>
  )
}

export default Analytics;
