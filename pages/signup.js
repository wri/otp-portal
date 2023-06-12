import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

import { getCountries } from 'modules/countries';

// Intl
import withIntl from 'hoc/with-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewForm from 'components/users/new';

class SignUp extends React.Component {
  static async getInitialProps({ url, store }) {
    await store.dispatch(getCountries());

    return { url };
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'signup' })}
        description={this.props.intl.formatMessage({ id: 'signup' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'signup' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        <UserNewForm />
      </Layout>
    );
  }
}

SignUp.propTypes = {
  url: PropTypes.shape({}).isRequired,
  intl: PropTypes.object.isRequired,
};

export default withIntl(
  connect(
    (state) => ({
      countries: state.countries,
    }),
    { getCountries }
  )(SignUp)
);
