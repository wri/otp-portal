import React from 'react';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { uniqBy } from 'utils/general';

import Notifications from 'components/ui/notifications';
import { logout } from 'services/user';
import { useOperators, useNotifications } from 'services/resources';
import modal from 'services/modal';
import useUser from 'hooks/use-user';

const NO_ITEMS = [];

const UserMenuList = ({ className, listItemClassName }) => {
  const intl = useIntl();
  const operators = useOperators().data || NO_ITEMS;
  const notifications = useNotifications(false).data || NO_ITEMS;
  const user = useUser();
  const handleNotificationsClick = () => {
    modal.toggleModal(true, {
      children: Notifications,
      childrenProps: {
        render: true
      },
      size: '-auto'
    });
  }
  const userOperators = operators.filter(o => user.operator_ids.includes(+o.id));

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
          {intl.formatMessage({ id: 'My profile' })}
        </Link>
      </li>
      {user.isOperator && (
        <li className={listItemClassName}>
          <Link
            href="/operator/edit"
            prefetch={false}
          >
            {intl.formatMessage({ id: 'Producer profile' })}
          </Link>
        </li>
      )}
      {user.isHolding && userOperators.map(operator => (
        <li key={`dropodown-operator-profile-${operator.id}`} className={listItemClassName}>
          <Link
            href={`/operator/edit/${operator.id}`}
            prefetch={false}
          >

            {intl.formatMessage({ id: 'company.profile', defaultMessage: `${operator.name} profile` }, { company: operator.name })}

          </Link>
        </li>
      ))}
      {(user.isOperator || user.isHolding) && userOperators.map(operator => (
        <li key={`dropdown-operator-docs-${operator.id}`} className={listItemClassName}>
          <Link
            href={`/operators/${operator.slug}/documentation`}
            prefetch={false}
          >

            {operator.name} {intl.formatMessage({ id: 'documentation' })}

          </Link>
        </li>
      ))}
      {user.isAdmin && (
        <li className={listItemClassName}>
          <a href="/admin" >{intl.formatMessage({ id: 'logged_in.dropdown.admin' })}</a>
        </li>
      )}
      <li className={listItemClassName}>
        <a
          onClick={() => {
            logout();
          }}
        >
          <span>{intl.formatMessage({ id: 'signout' })}</span>
        </a>
      </li>
    </ul>
  );
};

export default UserMenuList;

