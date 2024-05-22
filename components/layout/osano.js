import React from 'react';
import Script from 'next/script';

const Osano = () => {
  if (!process.env.OSANO_ID) return null;

  // This component is used in the _document.js file
  // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
  return <Script src={`https://cmp.osano.com/${process.env.OSANO_ID}/osano.js`} strategy="beforeInteractive" />
}

export default Osano;
