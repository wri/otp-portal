import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import Link from 'next/link';

// Redux
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import Spinner from 'components/ui/spinner';
import modal from 'services/modal';
import { getNotifications, dismissAll } from 'modules/notifications';

class Notifications extends React.Component {
  handleDismiss = () => {
    const { notifications } = this.props;

    this.props.dismissAll();
    modal.toggleModal(false);
  }

  closeModal = () => {
    modal.toggleModal(false);
  }

  componentDidMount() {
    const { user, render } = this.props;

    if (user.token && !render) {
      this.props.getNotifications();
    }
  }

  componentDidUpdate() {
    const { user, render, notifications } = this.props;

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
  }

  renderSingleNotification(notification) {
    const { language, intl } = this.props;
    const date = new Intl.DateTimeFormat('default', { timeZone: 'UTC' }).format(Date.parse(notification['expiration-date']));

    return (
      <>
        {notification['operator-document-name']} {notification['fmu-name']} {intl.formatMessage({ id: 'expires on' })} <span className="notification-date">{date}</span>
      </>
    )
  }

  renderNotifications() {
    const { notifications, intl } = this.props;

    if (!notifications.data.length && notifications.loading) {
      return (
        <div className="notifications-message" style={{ width: 300 }}>
          <Spinner className="-transparent -small" isLoading />
        </div>
      )
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

    return (
      <div>
        <h3>
          {intl.formatMessage({ id: 'Your company has documents that are expiring soon that will need to be updated:' })}
        </h3>

        {sortBy(notifications.data, 'fmu-name').map((notification) => (
          <p key={notification.id}>
            {this.renderSingleNotification(notification)}
          </p>
        ))}
      </div>
    )
  }

  renderNotificationsActions() {
    const { notifications, user, intl } = this.props;

    if (!notifications.data.length && notifications.loading) {
      return null;
    }

    if (!notifications.data.length) {
      return (
        <div className="notifications-actions">
          <button
            type="button"
            className="c-button -secondary"
            onClick={this.closeModal}
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
          onClick={this.closeModal}
        >
          {intl.formatMessage({ id: 'Remind me later' })}
        </button>

        <button
          type="button"
          className="c-button -primary"
          onClick={this.handleDismiss}
        >
          {intl.formatMessage({ id: 'Dismiss All' })}
        </button>

        <Link href={`/operators/${user.operator_ids[0]}/documentation`}>
          <a className="c-button -secondary">
            {intl.formatMessage({ id: 'Update Now' })}
          </a>
        </Link>
      </div>
    )
  }

  render() {
    const { notifications, render } = this.props;
    if (!render) return null;

    return (
      <div className="c-notifications">
        {this.renderNotifications()}
        {this.renderNotificationsActions()}
      </div>
    )
  }
}

Notifications.propTypes = {
  render: PropTypes.bool,
  user: PropTypes.object,
  notifications: PropTypes.object,
  getNotifications: PropTypes.func,
  dismissAll: PropTypes.func,
  language: PropTypes.string,
  intl: intlShape.isRequired
};

Notifications.defaultProps = {
  render: false
};

const ConnectedNotifications = injectIntl(
  connect(
  state => ({
    user: state.user,
    notifications: state.notifications,
    language: state.language
  }),
  { getNotifications, dismissAll }
  )(Notifications)
);

export default ConnectedNotifications;
