import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';
import Icon from 'components/ui/icon';
import NavigationList from 'components/ui/navigation-list';

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
              <NavigationList url={this.props.url} className="header-nav-list" />

              <ul className="header-nav-list c-navigation-list">
                <li>
                  <a>
                    <span>Search operator</span>
                    <Icon name="icon-search" />
                  </a>
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
