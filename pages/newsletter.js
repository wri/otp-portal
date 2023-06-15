import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewsLetterForm from 'components/users/newsletter';

class SignNewsletter extends React.Component {
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

        <UserNewsLetterForm />
      </Layout>
    );
  }
}

SignNewsletter.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired
};


export default injectIntl((SignNewsletter));
