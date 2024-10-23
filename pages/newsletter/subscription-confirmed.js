import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

const SubscriptionConfirmedPage = ({ url }) => {
  const intl = useIntl();

  return (
    <Layout
      title={intl.formatMessage({ id: 'newsletter' })}
      description={intl.formatMessage({ id: 'newsletter' })}
      url={url}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'newsletter' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <div className="c-section">
        <div className="c-form">
          <div className="c-title -big">
            <center>
              {intl.formatMessage({
                id: 'newsletter.subscription_confirmed',
                defaultMessage: "Your subscription is confirmed."
              })}
            </center>
          </div>

          <ul className="c-field-buttons -center-content">
            <li>
              <Link href="/" className="card-link c-button -primary -fullwidth">

                {intl.formatMessage({ id: 'Back to home page' })}

              </Link>
            </li>
          </ul>
        </div>
      </div>

    </Layout>
  );
}

SubscriptionConfirmedPage.getInitialProps = ({ url }) => ({ url });

SubscriptionConfirmedPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
};

export default SubscriptionConfirmedPage;
