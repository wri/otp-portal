import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import dynamic from 'next/dynamic';

import { useIntl } from 'react-intl';

import { connect } from 'react-redux';
import { logout } from 'modules/user';

import modal from 'services/modal';

import { Dropdown, DropdownTrigger, DropdownContent } from 'components/ui/dropdown';
import UserMenuList from 'components/ui/user-menu-list';
import Icon from 'components/ui/icon';
import DynamicLoading from 'components/ui/dynamic-loading';
import useUser from 'hooks/use-user';

const Login = dynamic(() => import('components/ui/login'), { ssr: false, loading: DynamicLoading });

const UserDropdown = ({ displayIcon, className, theme }) => {
  const intl = useIntl();
  const user = useUser();
  if (!user.isLoggedIn) {
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
  theme: PropTypes.string
}

UserDropdown.defaultProps = {
  displayIcon: true
}

export default connect(
  null,
  { logout }
)(UserDropdown);
