import React from 'react';

// Redux
import { connect } from 'react-redux';
import { getOperators } from 'modules/operators';
import { getCountries } from 'modules/countries';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import UserNewForm from 'components/users/new';

class SignUp extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { countries, operators } = this.props;

    if (!countries.data.length) {
      // Get countries
      this.props.getCountries();
    }

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'signup' })}
        description={this.props.intl.formatMessage({ id: 'signup' })}
        url={url}
        searchList={this.props.operators.data}
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
    operators: state.operators,
    countries: state.countries
  }),
  { getOperators, getCountries }
)(SignUp)));
