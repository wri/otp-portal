import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

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
            <h2 className="c-title -huge">
              {this.props.intl.formatMessage({ id: 'thankyou' })}
            </h2>

            <ul className="c-field-buttons">
              <li>
                <Link href="/operators">
                  <a className="card-link c-button -primary -fullwidth">
                    {this.props.intl.formatMessage({ id: 'operators' })}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/observations">
                  <a className="card-link c-button -primary -fullwidth">
                    {this.props.intl.formatMessage({ id: 'observations' })}
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
  intl: intlShape.isRequired
};


export default withTracker(withIntl((ThankYouPage)));
