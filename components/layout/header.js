import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from 'components/ui/icon';

export default class Header extends React.Component {

  render() {
    return (
      <header className="c-header">
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
                    <a>Operators</a>
                  </Link>
                </li>
                <li>
                  <Link prefetch href="/observators">
                    <a>Observators</a>
                  </Link>
                </li>
                <li>
                  <Link prefetch href="/help">
                    <a>Help</a>
                  </Link>
                </li>
                <li>
                  <Link prefetch href="/about">
                    <a>About</a>
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
  session: PropTypes.object.isRequired
};
