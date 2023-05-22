import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';

// Components
import NavigationList from 'components/ui/navigation-list';
import Search from 'components/ui/search';

import UserDropdown from 'components/ui/user-dropdown';

const Header = ({ url }) => {
  const theme = classnames({
    '-theme-default': (url.pathname !== '/'),
    '-theme-home': (url.pathname === '/')
  });

  return (
    <header className={`c-header ${theme}`}>
      <div className="l-container">
        <div className="header-container">
          <h1 className="header-logo">
            <Link href="/" prefetch={false}>
              <a>
                Open Timber Portal
              </a>
            </Link>
            {process.env.ENV === 'staging' && (
              <span className="header-logo-staging">Staging</span>
            )}
          </h1>
          <nav className="header-nav">
            <NavigationList url={url} className="header-nav-list" />

            <ul className="header-nav-list c-navigation-list">
              <li className="search">
                <Search theme={theme} />
              </li>
              <li>
                <UserDropdown theme={theme} />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  url: PropTypes.object.isRequired
};

export default Header;
