import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';

// Services
import modal from 'services/modal';

// Redux
import { connect } from 'react-redux';
import { logout } from 'modules/user';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Icon from 'components/ui/icon';
import NavigationList from 'components/ui/navigation-list';
import Search from 'components/ui/search';
import Login from 'components/ui/login';

class Header extends React.Component {
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
    const { user } = this.props;

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
                  />
                </li>

                <li>
                  {!user.token &&
                    <a
                      onClick={() => {
                        modal.toggleModal(true, {
                          children: Login
                        });
                      }}
                    >
                      <span>{this.props.intl.formatMessage({ id: 'signin' })}</span>
                      <Icon name="icon-user" />
                    </a>
                  }
                  {user.token &&
                    <a
                      onClick={() => {
                        this.props.logout();
                      }}
                    >
                      <span>{this.props.intl.formatMessage({ id: 'signout' })}</span>
                      <Icon name="icon-user" />
                    </a>
                  }
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
  user: PropTypes.object,
  searchList: PropTypes.array,
  intl: intlShape.isRequired,
  logout: PropTypes.func
};

export default injectIntl(connect(

  state => ({
    user: state.user
  }),
  { logout }
)(Header));
