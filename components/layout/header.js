import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';

// Components
import Icon from 'components/ui/icon';
import NavigationList from 'components/ui/navigation-list';
import Search from 'components/ui/search';

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
                <li className="search">
                  <Search
                    list={this.props.searchList}
                    placeholder="Search operator"
                    maxItems={8}
                  />
                </li>
                <li>
                  <Link prefetch href="/auth/signin">
                    <a>
                      <span>Sign in</span>
                      <Icon name="icon-user" />
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
  session: PropTypes.object.isRequired,
  searchList: PropTypes.array
};
