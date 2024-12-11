import React from 'react';
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import ResetPasswordForm from 'components/users/reset-password';

function ResetPassword() {
  const intl = useIntl();
  const router = useRouter();

  return (
    <Layout
      title={intl.formatMessage({ id: 'Reset Password' })}
      description={intl.formatMessage({ id: 'Reset Password' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'Reset Password' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <ResetPasswordForm token={router.query.reset_password_token} />
    </Layout>
  );
}

ResetPassword.getInitialProps = async ({ req, asPath, locale }) => {
  if (req) {
    const cookies = req.cookies;
    const nextLocale = cookies['NEXT_LOCALE'] || 'en';
    if (nextLocale !== 'en' && locale !== nextLocale) {
      return {
        redirectTo: `/${nextLocale}${asPath}`,
        redirectPermanent: false
      }
    }
  }

  return { };
}

export default ResetPassword;
