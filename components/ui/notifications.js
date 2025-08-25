import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import Link from 'next/link';

// Redux
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';

import Spinner from 'components/ui/spinner';
import modal from 'services/modal';
import { groupBy } from 'utils/general';
import { getNotifications, dismissAll } from 'modules/notifications';

function isBeforeToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

const Notifications = ({ user, notifications, render, getNotifications, dismissAll }) => {
  const intl = useIntl();
  const handleDismiss = () => {
    dismissAll();
    modal.toggleModal(false);
  };

  const closeModal = () => {
    modal.toggleModal(false);
  };

  useEffect(() => {
    if (user.token && !render) {
      getNotifications();
    }
  }, [user.token, render, getNotifications]);

  useEffect(() => {
    if (!render
      && user.token
      && notifications.data.length
      && !localStorage.getItem('notificationsShown')
    ) {
      modal.toggleModal(true, {
        children: ConnectedNotifications,
        childrenProps: {
          render: true
        },
        size: '-auto'
      });
      localStorage.setItem('notificationsShown', true);
    }
  }, [render, user.token, notifications.data.length]);

  const renderSingleNotification = (notification) => {
    const expirationDate = new Date(notification['expiration-date']);
    const date = new Intl.DateTimeFormat('default', { timeZone: 'UTC' }).format(expirationDate);

    const expiredText = isBeforeToday(expirationDate) ? 'expired on' : 'expires on';

    return (
      <>
        {notification['operator-document-name']} {notification['fmu-name'] ? `(${notification['fmu-name']})` : ''} {intl.formatMessage({ id: expiredText })} <span className="notification-date">{date}</span>
      </>
    );
  };

  const renderCompanyNotifications = (notifications) => {
    // if there are two notifications for the same document just show one, as expiration date will be the same
    const expiringSoon = uniqBy(
      notifications.filter(x => !isBeforeToday(new Date(x['expiration-date']))),
      'operator-document-id'
    );
    const expired = uniqBy(
      notifications.filter(x => isBeforeToday(new Date(x['expiration-date']))),
      'operator-document-id'
    );
    const company = notifications[0]['operator-name'];

    return (
      <div>
        {expired.length > 0 && (
          <>
            <h3>
              {intl.formatMessage({ id: 'notifications.expired_note', defaultMessage: '{company} has documents that have expired that need to be updated:' }, { company })}
            </h3>

            {sortBy(expired, ['fmu-name', 'expiration-date']).map((notification) => (
              <p key={notification.id}>
                {renderSingleNotification(notification)}
              </p>
            ))}
          </>
        )}

        {expiringSoon.length > 0 && (
          <>
            <h3>
              {intl.formatMessage({ id: 'notifications.expiring_soon_note', defaultMessage: '{company} has documents that are expiring soon that will need to be updated:' }, { company })}
            </h3>

            {sortBy(expiringSoon, ['fmu-name', 'expiration-date']).map((notification) => (
              <p key={notification.id}>
                {renderSingleNotification(notification)}
              </p>
            ))}
          </>
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    if (!notifications.data.length && notifications.loading) {
      return (
        <div className="notifications-message" style={{ width: 300 }}>
          <Spinner className="-transparent -small" isLoading />
        </div>
      );
    }

    if (!notifications.data.length) {
      return (
        <div className="notifications-message">
          <p>
            {intl.formatMessage({ id: 'There are no new notifications.' })}
          </p>
        </div>
      );
    }

    const groupedByCompany = groupBy(notifications.data, 'operator-id');

    return Object.keys(groupedByCompany).map((operatorId) => {
      const companyNotifications = groupedByCompany[operatorId];

      return (
        <div key={operatorId}>
          {renderCompanyNotifications(companyNotifications)}
        </div>
      );
    });
  };

  const renderNotificationsActions = () => {
    if (!notifications.data.length && notifications.loading) {
      return null;
    }

    if (!notifications.data.length) {
      return (
        <div className="notifications-actions">
          <button
            type="button"
            className="c-button -secondary"
            onClick={closeModal}
          >
            {intl.formatMessage({ id: 'Close' })}
          </button>
        </div>
      );
    }

    return (
      <div className="notifications-actions">
        <button
          type="button"
          className="c-button -primary"
          onClick={closeModal}
        >
          {intl.formatMessage({ id: 'Remind me later' })}
        </button>

        <button
          type="button"
          className="c-button -primary"
          onClick={handleDismiss}
        >
          {intl.formatMessage({ id: 'Dismiss All' })}
        </button>

        <Link
          href={`/operators/${user.operator_ids[0]}/documentation`}
          className="c-button -secondary">

          {intl.formatMessage({ id: 'Update Now' })}

        </Link>
      </div>
    );
  };

  if (!render) return null;

  return (
    <div className="c-notifications">
      {renderNotifications()}
      {renderNotificationsActions()}
    </div>
  );
};

Notifications.propTypes = {
  render: PropTypes.bool,
  user: PropTypes.object,
  notifications: PropTypes.object,
  getNotifications: PropTypes.func,
  dismissAll: PropTypes.func,
  language: PropTypes.string
};

Notifications.defaultProps = {
  render: false
};

const ConnectedNotifications = connect(
  state => ({
    user: state.user,
    notifications: state.notifications,
    language: state.language
  }),
  { getNotifications, dismissAll }
)(Notifications);

export default ConnectedNotifications;
