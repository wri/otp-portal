import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Redux
import { connect } from 'react-redux';
import { getUserProfile } from 'modules/user';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserEditForm from 'components/users/edit';
import Spinner from 'components/ui/spinner';

const Profile = ({ url, userProfile }) => {
  const intl = useIntl();

  return (
    <Layout
      title={intl.formatMessage({ id: 'User profile' })}
      description={intl.formatMessage({ id: 'User profile' })}
      url={url}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'User profile' })}
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

Profile.getInitialProps = async ({ store, url }) => {
  const state = store.getState();
  if (!state.user || !state.user.token) {
    return { redirectTo: '/', redirectPermanent: false };
  }

  await store.dispatch(getUserProfile());
  return { url };
}

Profile.propTypes = {
  url: PropTypes.object.isRequired,
  user: PropTypes.object,
  userProfile: PropTypes.object
};

export default connect(
  state => ({
    user: state.user,
    userProfile: state.user.userProfile
  }),
)(Profile);
