import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

import modal from 'services/modal';
import { getNotifications } from 'modules/notifications';

class Notifications extends React.Component {
  componentDidMount() {
    const { user, render } = this.props;

    if (user.token && !render && !sessionStorage.getItem("notificationsShown")) {
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
        {notifications.data.map((notification) => (
          <p>
            Document {notification['operator-document-name']} expires soon at <span className="notification-date">{notification['expiration-date']}</span>
          </p>
        ))}
      </div>
    )
  }
}

Notifications.propTypes = {
  render: PropTypes.bool,
  user: PropTypes.object,
  notifications: PropTypes.object,
  getNotifications: PropTypes.func
};

Notifications.defaultProps = {
  render: false
};

export default connect(
  state => ({
    user: state.user,
    notifications: state.notifications
  }),
  { getNotifications }
)(Notifications)
