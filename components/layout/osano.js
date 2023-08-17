import React from 'react';
import Script from 'next/script';

const Osano = () => {
  if (!process.env.OSANO_ID) return null;

  return <Script src={`https://cmp.osano.com/${process.env.OSANO_ID}/osano.js`} strategy="beforeInteractive" />
}

export default Osano;
