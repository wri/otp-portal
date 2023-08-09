import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import Link from 'next/link';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';

import Notifications from 'components/ui/notifications';
import { logout } from 'modules/user';
import modal from 'services/modal';

const UserMenuList = ({ className, listItemClassName, user, operators, notifications, logout: userLogout }) => {
  const intl = useIntl();
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
    <ul className={className}>
      <li className={listItemClassName}>
        <a onClick={handleNotificationsClick}>
          Notifications ({uniqBy(notifications, 'operator-document-id').length})
        </a>
      </li>
      <li className={listItemClassName}>
        <Link
          href="/profile"
          prefetch={false}
        >
          <a>{intl.formatMessage({ id: 'My profile' })}</a>
        </Link>
      </li>
      {(user.role === 'operator' || user.role === 'holding') && (
        <li className={listItemClassName}>
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
          <li key={`dropdown-operator-${id}`} className={listItemClassName}>
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
        <li className={listItemClassName}>
          <a href="/admin" >{intl.formatMessage({ id: 'logged_in.dropdown.admin' })}</a>
        </li>
      )}
      <li className={listItemClassName}>
        <a
          onClick={() => {
            userLogout();
          }}
        >
          <span>{intl.formatMessage({ id: 'signout' })}</span>
        </a>
      </li>
    </ul>
  )
};

export default connect(
  state => ({
    user: state.user,
    operators: state.operators.data,
    notifications: state.notifications.data
  }),
  { logout }
)(UserMenuList);

