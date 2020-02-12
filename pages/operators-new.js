import React from 'react';

// Redux
import withTracker from 'components/layout/with-tracker';
import { setUser } from 'modules/user';
import { setRouter } from 'modules/router';
import { getOperators } from 'modules/operators';


// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import NewOperator from 'components/operators/new';

class OperatorsNew extends React.Component {
  static async getInitialProps({ req, asPath, pathname, query, store, isServer }) {
    const { operators } = store.getState();
    const url = { asPath, pathname, query };
    let user = null;

    if (isServer) {
      user = req.session ? req.session.user : {};
    } else {
      user = store.getState().user;
    }

    store.dispatch(setUser(user));
    store.dispatch(setRouter(url));

    if (!operators.data.length) {
      await store.dispatch(getOperators());
    }

    return { isServer, url };
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'new.operators' })}
        description={this.props.intl.formatMessage({ id: 'new.operators.description' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'new.operators' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        <NewOperator />

      </Layout>
    );
  }
}

OperatorsNew.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(OperatorsNew));
