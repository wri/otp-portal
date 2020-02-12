import React from 'react';

// Redux
import { connect } from 'react-redux';
import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { setLanguage } from 'modules/language';
import { getOperators } from 'modules/operators';

import { getCountries } from 'modules/countries';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewForm from 'components/users/new';

class SignUp extends React.Component {
  static async getInitialProps({ req, asPath, pathname, query, store, isServer }) {
    const { operators } = store.getState();
    const url = { asPath, pathname, query };
    let user = null;
    let lang = 'en';

    if (isServer) {
      lang = req.locale.language;
      user = req.session ? req.session.user : {};
    } else {
      lang = store.getState().language;
      user = store.getState().user;
    }

    store.dispatch(setLanguage(lang));
    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));

    if (!operators.data.length) {
      await store.dispatch(getOperators());
    }

    return { isServer, url };
  }

  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { countries } = this.props;

    if (!countries.data.length) {
      // Get countries
      this.props.getCountries();
    }
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
  intl: intlShape.isRequired
};


export default withTracker(withIntl(connect(
  state => ({
    countries: state.countries
  }),
  { getCountries }
)(SignUp)));
