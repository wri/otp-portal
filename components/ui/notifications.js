import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Redux
import { connect } from 'react-redux';

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

  renderNotifications() {
    const { notifications } = this.props;

    if (!notifications.data.length && notifications.loading) {
      return (
        <div className="notifications-message">
          <p>
            Loading...
          </p>
        </div>
      )
    }

    if (!notifications.data.length) {
      return (
        <div className="notifications-message">
          <p>There are no new notifications.</p>
        </div>
      );
    }

    return (
      <div>
        {sortBy(notifications.data, 'fmu-name').map((notification) => (
          <p>
            {notification['fmu-name'] ? (
              <>
                {notification['fmu-name']} document {notification['operator-document-name']} expires at <span className="notification-date">{notification['expiration-date']}</span>
              </>
            ) : (
              <>
                Document {notification['operator-document-name']} expires at <span className="notification-date">{notification['expiration-date']}</span>
              </>
            )}
          </p>
        ))}
      </div>
    )
  }

  renderNotificationsActions() {
    const { notifications } = this.props;

    if (!notifications.data.length) {
      return (
        <div className="notifications-actions">
          <button
            type="button"
            className="c-button -secondary"
            onClick={this.closeModal}
          >
            Close
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
          Remind me later
        </button>

        <button
          type="button"
          className="c-button -secondary"
          onClick={this.handleDismiss}
        >
          Dismiss All
        </button>
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
  dismissAll: PropTypes.func
};

Notifications.defaultProps = {
  render: false
};

const ConnectedNotifications = connect(
  state => ({
    user: state.user,
    notifications: state.notifications
  }),
  { getNotifications, dismissAll }
)(Notifications);

export default ConnectedNotifications;
