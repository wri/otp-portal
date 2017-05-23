import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';
import Icon from 'components/ui/icon';

export default class Header extends React.Component {
  /**
   * HELPERS
   * - setTheme
   * - setActive
  */
  setTheme() {
    const { url } = this.props;

    return classnames({
      '-theme-default': (url.pathname !== '/'),
      '-theme-home': (url.pathname === '/')
    });
  }

  setActive(pathname) {
    const { url } = this.props;
    return classnames({
      '-active': (url.pathname === pathname)
    });
  }

  render() {
    return (
      <header className={`c-header ${this.setTheme()}`}>
        <div className="l-container">
          <div className="header-container">
            <h1 className="header-logo">
              <Link prefetch href="/">
                <a>Open Timber Portal</a>
              </Link>
            </h1>
            <nav className="header-nav">
              <ul className="header-nav-list">
                <li>
                  <Link prefetch href="/operators">
                    <a className={this.setActive('/operators')}>Operators</a>
                  </Link>
                </li>
                <li>
                  <Link prefetch href="/observators">
                    <a className={this.setActive('/observators')}>Observators</a>
                  </Link>
                </li>
                <li>
                  <Link prefetch href="/help">
                    <a className={this.setActive('/help')}>Help</a>
                  </Link>
                </li>
                <li>
                  <Link prefetch href="/about">
                    <a className={this.setActive('/about')}>About</a>
                  </Link>
                </li>
              </ul>

              <ul className="header-nav-list">
                <li>
                  <Link prefetch href="/search">
                    <a>
                      <span>Search</span>
                      <Icon name="icon-search" />
                    </a>
                  </Link>
                </li>
                <li>
                  <Link prefetch href="/auth/signin">
                    <a>
                      <span>Sign in</span>
                      <Icon name="icon-search" />
                    </a>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  url: PropTypes.object.isRequired,
  session: PropTypes.object.isRequired
};
