import React from 'react';
import Script from 'next/script';

const HotJar = () => {
  if (process.env.DISABLE_HOTJAR === 'true') return null;
  if (!process.env.ENV === 'production') return null;

  return (
    <Script id="hotjar" strategy="afterInteractive">
      {`
      (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:3036814,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
              })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `}
    </Script>
  )
}

export default HotJar;

