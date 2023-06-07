import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import { injectIntl, intlShape } from 'react-intl';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import { connect } from 'react-redux';
import { logout } from 'modules/user';

import modal from 'services/modal';

import Notifications from 'components/ui/notifications';
import Login from 'components/ui/login';
import Icon from 'components/ui/icon';

const UserDropdown = ({ intl, user, logout: userLogout, operators, notifications, theme }) => {
  if (!user.token) {
    return (
      <a
        onClick={() => {
          modal.toggleModal(true, {
            children: Login
          });
        }}
      >
        <Icon name="icon-user" />
        <span>{intl.formatMessage({ id: 'signin' })}</span>
      </a>
    )
  }

  const handleNotificationsClick = () => {
    modal.toggleModal(true, {
      children: Notifications,
      childrenProps: {
        render: true
      },
      size: '-auto'
    });
  }

  return (
    <Dropdown
      className={`c-account-dropdown ${theme}`}
    >
      <DropdownTrigger>
        <div className="header-nav-list-item">
          <Icon name="icon-user" />
          <span>{intl.formatMessage({ id: 'logged_in.trigger' })}</span>
        </div>
      </DropdownTrigger>

      <DropdownContent>
        <ul className="account-dropdown-list">
          <li className="account-dropdown-list-item">
            <a onClick={handleNotificationsClick}>
              Notifications ({uniqBy(notifications, 'operator-document-id').length})
            </a>
          </li>
          <li className="account-dropdown-list-item">
            <Link
              href="/profile"
              prefetch={false}
            >
              <a>{intl.formatMessage({ id: 'My profile' })}</a>
            </Link>
          </li>
          {(user.role === 'operator' || user.role === 'holding') && (
            <li className="account-dropdown-list-item">
              <Link
                href="/operators/edit"
                prefetch={false}
              >
                <a>{intl.formatMessage({ id: 'Producer profile' })}</a>
              </Link>
            </li>
          )}
          {(user.role === 'operator' || user.role === 'holding') && uniq(user.operator_ids).map(id => {
            const operator = operators.find(o => +o.id === id);
            if (!operator) return null;

            return (
              <li key={`dropdown-operator-${id}`} className="account-dropdown-list-item">
                <Link
                  href={`/operators/${operator.slug}/documentation`}
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
              <a href="/admin" >{intl.formatMessage({ id: 'logged_in.dropdown.admin' })}</a>
            </li>
          )}
          <li className="account-dropdown-list-item">
            <a
              onClick={() => {
                userLogout();
              }}
            >
              <span>{intl.formatMessage({ id: 'signout' })}</span>
            </a>
          </li>
        </ul>
      </DropdownContent>
    </Dropdown>
  )
}

UserDropdown.propTypes = {
  theme: PropTypes.string,
  user: PropTypes.object,
  intl: intlShape.isRequired,
  operators: PropTypes.array,
  notifications: PropTypes.array,
  logout: PropTypes.func
}

export default injectIntl(connect(
  state => ({
    user: state.user,
    operators: state.operators.data,
    notifications: state.notifications.data
  }),
  { logout }
)(UserDropdown));
