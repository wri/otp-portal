import React from 'react';
import { isEmpty } from 'utils/general';

// Redux
import { getUserProfile } from 'modules/user';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserEditForm from 'components/users/edit';
import Spinner from 'components/ui/spinner';
import useUser from '~/hooks/use-user';

const Profile = () => {
  const intl = useIntl();
  const { userProfile } = useUser();

  return (
    <Layout
      title={intl.formatMessage({ id: 'User profile' })}
      description={intl.formatMessage({ id: 'User profile' })}
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

Profile.getInitialProps = async ({ store }) => {
  const state = store.getState();
  if (!state.user || !state.user.token) {
    return { redirectTo: '/', redirectPermanent: false };
  }

  await store.dispatch(getUserProfile());
  return {};
}

export default Profile;
