import React from 'react';

// Redux
import withRedux from 'next-redux-wrapper';
import { store } from 'store';
import { getOperators } from 'modules/operators';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import Signup from 'components/ui/signup';

class SignUpPage extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { operators } = this.props;

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title="Register"
        description="Register description..."
        url={url}
        searchList={this.props.operators.data}
      >
        <StaticHeader
          title="Sign up"
          background="/static/images/static-header/bg-help.jpg"
        />

        <Signup />

      </Layout>
    );
  }
}

SignUpPage.propTypes = {
  intl: intlShape.isRequired
};


export default withIntl(withRedux(
  store,
  state => ({
    operators: state.operators
  }),
  { getOperators }
)(SignUpPage));
