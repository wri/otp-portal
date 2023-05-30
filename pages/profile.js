import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Next
import Router from 'next/router';

// Redux
import { connect } from 'react-redux';
import { getUserProfile } from 'modules/user';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserEditForm from 'components/users/edit';
import Spinner from 'components/ui/spinner';

class Profile extends React.Component {
  static async getInitialProps({ store, url }) {
    await store.dispatch(getUserProfile());
    return { url };
  }

  componentDidUpdate(/* prevProps */) {
    if (!this.props.user) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }

  render() {
    const { url, userProfile } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'User profile' })}
        description={this.props.intl.formatMessage({ id: 'edit.profile.description' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'User profile' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        {userProfile && userProfile.loading && (
          <Spinner isLoading={userProfile.loading} className="-light -fixed" />
        )}

        {userProfile && !isEmpty(userProfile.data) && (
          <UserEditForm userProfile={userProfile.data} />
        )}

      </Layout>
    );
  }
}

Profile.propTypes = {
  url: PropTypes.string,
  user: PropTypes.object,
  userProfile: PropTypes.object,
  intl: intlShape.isRequired
};

export default withIntl(connect(
  state => ({
    user: state.user,
    userProfile: state.user.userProfile
  }),
)(Profile));
