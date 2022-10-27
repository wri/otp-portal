import React from 'react';
import Link from 'next/link';
import NavigationList from 'components/ui/navigation-list';

const Footer = () => (
  <footer className="c-footer">
    <div className="upper-footer">
      <div className="l-container">
        <div className="footer-container">
          <div className="footer-item">
            <h1 className="logo">
              <Link href="/" prefetch={false}>
                <a>Open Timber Portal</a>
              </Link>
            </h1>
          </div>
          <div className="footer-item">
            <NavigationList hideActive />
          </div>
        </div>
      </div>
    </div>

    <div className="lower-footer">
      <div className="l-container">
        <div className="footer-container">
          <div className="footer-item">
            <a href="http://www.wri.org/" target="_blank" rel="noreferrer noopener">
              <img src="/static/images/logos/wri-logo.svg" alt="WRI logo" width="155" height="55" />
            </a>
          </div>
          <div className="footer-item">
            <p className="-bold">World Resources Institute</p>
            <p>10 G Street NE Suite 800, Washington, DC 20002, USA</p>
            <p>Phone +1(202) 729-7600    |    Fax: +1 (202) 720 7610</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
export default Footer;
