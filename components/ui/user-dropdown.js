import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import dynamic from 'next/dynamic';

import { injectIntl } from 'react-intl';

import { connect } from 'react-redux';
import { logout } from 'modules/user';

import modal from 'services/modal';

import { Dropdown, DropdownTrigger, DropdownContent } from 'components/ui/dropdown';
import UserMenuList from 'components/ui/user-menu-list';
import Icon from 'components/ui/icon';

const Login = dynamic(() => import('components/ui/login'), { ssr: false });

const UserDropdown = ({ intl, user, displayIcon, className, theme }) => {
  if (!user.token) {
    return (
      <div
        className={className}
        role="button"
        onClick={() => {
          modal.toggleModal(true, {
            children: Login
          });
        }}
      >
        {displayIcon && <Icon name="icon-user" />}
        <span>{intl.formatMessage({ id: 'signin' })}</span>
      </div>
    )
  }

  return (
    <Dropdown
      className={cx('c-account-dropdown', theme, className)}
    >
      <DropdownTrigger>
        <div className="header-nav-list-item">
          {displayIcon && <Icon name="icon-user" />}
          <span>{intl.formatMessage({ id: 'logged_in.trigger' })}</span>
        </div>
      </DropdownTrigger>

      <DropdownContent>
        <UserMenuList className="account-dropdown-list" listItemClassName="account-dropdown-list-item" />
      </DropdownContent>
    </Dropdown>
  )
}

UserDropdown.propTypes = {
  displayIcon: PropTypes.bool,
  theme: PropTypes.string,
  user: PropTypes.object,
  intl: PropTypes.object.isRequired
}

UserDropdown.defaultProps = {
  displayIcon: true
}

export default injectIntl(connect(
  state => ({
    user: state.user
  }),
  { logout }
)(UserDropdown));
