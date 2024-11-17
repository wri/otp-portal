import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';

// Components
import NavigationList from 'components/ui/navigation-list';
import MobileMenu from 'components/ui/mobile-menu';
import Search from 'components/ui/search';
import Hamburger from 'components/ui/hamburger';

import LanguageDropdown from 'components/ui/language-dropdown';
import UserDropdown from 'components/ui/user-dropdown';

import useDeviceInfo from 'hooks/use-device-info';

const Header = ({ url }) => {
  const isHomePage = url.pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDesktop } = useDeviceInfo();
  const isMenuOpen = menuOpen && !isDesktop;
  const theme = isMenuOpen || !isHomePage ? '-theme-default' : '-theme-home';
  const hamburgerTheme = classnames({
    '-theme-light': !isMenuOpen,
    '-theme-dark': isMenuOpen || (!isHomePage && !isMenuOpen)
  });

  return (
    <header className={classnames('c-header', theme, { 'open': isMenuOpen, '-home': isHomePage })}>
      <div className="l-container">
        <div className="header-container">
          <h1 className="header-logo">
            <Link href="/" prefetch={false}>

                Open Timber Portal

            </Link>
            {process.env.ENV === 'staging' && (
              <span className="header-logo-staging">Staging</span>
            )}
          </h1>
          <nav className="header-nav -desktop">
            <NavigationList url={url} className="header-nav-list" />

            <ul className="header-nav-list c-navigation-list">
              <li className="search">
                <Search theme={theme} />
              </li>
              <li>
                <UserDropdown theme={theme} className="header-nav-list-item" />
              </li>
              <li>
                <LanguageDropdown className="header-nav-list-item" showSelectedCode />
              </li>
            </ul>
          </nav>
          <nav className="header-nav -mobile">
            <ul className="header-nav-list c-navigation-list">
              <li>
                <Hamburger theme={hamburgerTheme} isOpen={isMenuOpen} onClick={() => setMenuOpen(!isMenuOpen)} />
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {isMenuOpen && (
        <MobileMenu url={url} />
      )}
    </header>
  );
}

Header.propTypes = {
  url: PropTypes.object.isRequired
};

export default Header;
