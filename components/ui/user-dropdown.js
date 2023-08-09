import React from 'react';
import PropTypes from 'prop-types';

import Dropdown, { DropdownTrigger, DropdownContent } from 'react-simple-dropdown';
import { injectIntl } from 'react-intl';

import { connect } from 'react-redux';
import { logout } from 'modules/user';

import modal from 'services/modal';

import UserMenuList from 'components/ui/user-menu-list';
import Login from 'components/ui/login';
import Icon from 'components/ui/icon';

const UserDropdown = ({ intl, user, displayIcon, theme }) => {
  if (!user.token) {
    return (
      <a
        onClick={() => {
          modal.toggleModal(true, {
            children: Login
          });
        }}
      >
        {displayIcon && <Icon name="icon-user" />}
        <span>{intl.formatMessage({ id: 'signin' })}</span>
      </a>
    )
  }

  return (
    <Dropdown
      className={`c-account-dropdown ${theme}`}
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
