import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';

class ThankYouPage extends React.Component {
  static async getInitialProps({ url }) {
    return { url };
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'newsletter' })}
        description={this.props.intl.formatMessage({ id: 'newsletter' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'newsletter' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        <div className="c-section">
          <div className="c-form">
            <div className="c-title -big">
              <p>
                {this.props.intl.formatMessage({
                  id: 'newsletter.thankyou.paragraph1',
                  defaultMessage: "Thanks for your information - there's just one more step to finalize your request!"
                })}
              </p>
              <p>
                {this.props.intl.formatMessage({
                  id: 'newsletter.thankyou.paragraph2',
                  defaultMessage: "To confirm your request to receive emails from us, please check your inbox for a confirmation email and click on the button to finalize your subscription."
                })}
              </p>
            </div>

            <ul className="c-field-buttons">
              <li>
                <Link href="/">
                  <a className="card-link c-button -primary -fullwidth">
                    {this.props.intl.formatMessage({ id: 'Back to home page' })}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

      </Layout>
    );
  }
}

ThankYouPage.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired
};


export default injectIntl((ThankYouPage));
