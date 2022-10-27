import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Link from 'next/link';

import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

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
import Notifications from 'components/ui/notifications';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';

class Header extends React.Component {
  handleNotificationsClick = () => {
    modal.toggleModal(true, {
      children: Notifications,
      childrenProps: {
        render: true
      },
      size: '-auto'
    });
  }

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
    const { user, operators, notifications } = this.props;

    return (
      <header className={`c-header ${this.setTheme()}`}>
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
              <NavigationList url={this.props.url} className="header-nav-list" />

              <ul className="header-nav-list c-navigation-list">
                <li className="search">
                  <Search
                    theme={this.setTheme()}
                  />
                </li>

                <li>
                  {!user.token && (
                    <a
                      onClick={() => {
                        modal.toggleModal(true, {
                          children: Login
                        });
                      }}
                    >
                      <Icon name="icon-user" />
                      <span>{this.props.intl.formatMessage({ id: 'signin' })}</span>
                    </a>
                  )}

                  {user.token && (
                    <Dropdown
                      className={`c-account-dropdown ${this.setTheme()}`}
                      ref={(d) => { this.dropdown = d; }}
                    >
                      <DropdownTrigger>
                        <div className="header-nav-list-item">
                          <Icon name="icon-user" />
                          <span>{this.props.intl.formatMessage({ id: 'logged_in.trigger' })}</span>
                        </div>
                      </DropdownTrigger>

                      <DropdownContent>
                        <ul className="account-dropdown-list">
                          <li className="account-dropdown-list-item">
                            <a onClick={this.handleNotificationsClick}>
                              Notifications ({uniqBy(notifications, 'operator-document-id').length})
                            </a>
                          </li>
                          <li className="account-dropdown-list-item">
                            <Link
                              href="/profile"
                              prefetch={false}
                            >
                              <a>{this.props.intl.formatMessage({ id: 'My profile' })}</a>
                            </Link>
                          </li>
                          {(user.role === 'operator' || user.role === 'holding') && (
                            <li className="account-dropdown-list-item">
                              <Link
                                href="/operators/edit"
                                prefetch={false}
                              >
                                <a>{this.props.intl.formatMessage({ id: 'Producer profile' })}</a>
                              </Link>
                            </li>
                          )}
                          {(user.role === 'operator' || user.role === 'holding') && uniq(user.operator_ids).map(id => {
                            const operator = operators.find(o => +o.id === id);
                            if (!operator) return null;

                            return (
                              <li className="account-dropdown-list-item">
                                <Link
                                  href={`/operators/${id}/documentation`}
                                  prefetch={false}
                                >
                                  <a>
                                    {operator.name}
                                  </a>
                                </Link>
                              </li>
                            )
                          })}
                          {user.role === 'admin' && (
                            <li className="account-dropdown-list-item">
                              <a href="/admin" >{this.props.intl.formatMessage({ id: 'logged_in.dropdown.admin' })}</a>
                            </li>
                          )}
                          <li className="account-dropdown-list-item">
                            <a
                              onClick={() => {
                                this.props.logout();
                              }}
                            >
                              <span>{this.props.intl.formatMessage({ id: 'signout' })}</span>
                            </a>
                          </li>
                        </ul>
                      </DropdownContent>
                    </Dropdown>
                  )}
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
  operators: PropTypes.array,
  notifications: PropTypes.array,
  intl: intlShape.isRequired,
  logout: PropTypes.func
};

export default injectIntl(connect(

  state => ({
    user: state.user,
    operators: state.operators.data,
    notifications: state.notifications.data
  }),
  { logout }
)(Header));
