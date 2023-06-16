import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import ResetPasswordForm from 'components/users/reset-password';

function ResetPassword({ url, intl }) {
  return (
    <Layout
      title={intl.formatMessage({ id: 'Reset Password' })}
      description={intl.formatMessage({ id: 'Reset Password' })}
      url={url}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'Reset Password' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <ResetPasswordForm token={url.query.reset_password_token} />
    </Layout>
  );
}

ResetPassword.getInitialProps = ({ url }) => ({ url });

ResetPassword.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(ResetPassword);
