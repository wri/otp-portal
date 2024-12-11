import React from 'react';
import Link from 'next/link';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

const ThankYouPage = () => {
  const intl = useIntl();

  return (
    <Layout
      title={intl.formatMessage({ id: 'newsletter' })}
      description={intl.formatMessage({ id: 'newsletter' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'newsletter' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <div className="c-section">
        <div className="c-form">
          <div className="c-title -big">
            <p>
              {intl.formatMessage({
                id: 'newsletter.thankyou.paragraph1',
                defaultMessage: "Thanks for your information - there's just one more step to finalize your request!"
              })}
            </p>
            <p>
              {intl.formatMessage({
                id: 'newsletter.thankyou.paragraph2',
                defaultMessage: "To confirm your request to receive emails from us, please check your inbox for a confirmation email and click on the button to finalize your subscription."
              })}
            </p>
          </div>

          <ul className="c-field-buttons">
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

export default ThankYouPage;
