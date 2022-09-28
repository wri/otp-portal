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

  handleRemindLater = () => {
    modal.toggleModal(false);
  }

  componentDidMount() {
    const { user, render } = this.props;

    if (user.token
      && !render) {
      /* && !sessionStorage.getItem("notificationsShown")) { */
      this.props.getNotifications();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.notifications
      && nextProps.notifications.data
      && nextProps.notifications.data.length > 0
      && !nextProps.render
    ) {
      modal.toggleModal(true, {
        children: Notifications,
        childrenProps: {
          ...nextProps,
          render: true
        },
        size: '-auto'
      });
      sessionStorage.setItem("notificationsShown", true);
    }
  }

  render() {
    const { notifications, render } = this.props;
    if (!render) return null;

    return (
      <div className="c-notifications">
        <div>
          {sortBy(notifications.data, 'fmu-name').map((notification) => (
            <p>
              {notification['fmu-name'] ? (
                <>
                  {notification['fmu-name']} document {notification['operator-document-name']} expires soon at <span className="notification-date">{notification['expiration-date']}</span>
                </>
              ) : (
                <>
                  Document {notification['operator-document-name']} expires soon at <span className="notification-date">{notification['expiration-date']}</span>
                </>
              )}
            </p>
          ))}
        </div>

        <div className="notifications-actions">
          <button
            type="button"
            className="c-button -primary"
            onClick={this.handleRemindLater}
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

export default connect(
  state => ({
    user: state.user,
    notifications: state.notifications
  }),
  { getNotifications, dismissAll }
)(Notifications)
