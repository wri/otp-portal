import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserEditForm from 'components/users/edit';

import { fetchUserProfile } from 'services/user';

const Profile = ({ userProfile }) => {
  const intl = useIntl();

  return (
    <Layout
      title={intl.formatMessage({ id: 'User profile' })}
      description={intl.formatMessage({ id: 'User profile' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'User profile' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      {userProfile && (
        <UserEditForm userProfile={userProfile} />
      )}

    </Layout>
  );
}

Profile.getInitialProps = async ({ user }) => {
  if (!user || !user.user_id) {
    return { redirectTo: '/', redirectPermanent: false };
  }

  const userProfile = await fetchUserProfile(user.user_id).catch((error) => {
    console.error(error);
    return null;
  });
  return { userProfile };
}

Profile.propTypes = {
  userProfile: PropTypes.object
};

export default Profile;
