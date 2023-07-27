import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

// Next
import Router from 'next/router';

// Redux
import { connect } from 'react-redux';
import { getUserOperator } from 'modules/user';
import { getOperators } from 'modules/operators';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import EditOperator from 'components/operators/edit';
import Spinner from 'components/ui/spinner';

class OperatorsEdit extends React.Component {
  static async getInitialProps({ store, url }) {
    const { user } = store.getState();

    if (user.operator_ids) {
      await store.dispatch(getUserOperator(user.operator_ids[0]));
    }
    return { url };
  }

  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { user } = this.props;

    if (!user.operator_ids) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }

  componentDidUpdate(/* prevProps */) {
    if (!this.props.user.operator_ids) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }

  handleOperatorEditSubmit = () => {
    this.props.getOperators();
    this.props.getUserOperator(this.props.user.operator_ids[0]);
  }

  render() {
    const { url, user, userOperator } = this.props;

    if (!user.operator_ids) {
      return null;
    }

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'edit.operators' })}
        description={this.props.intl.formatMessage({ id: 'edit.operators.description' })}
        url={url}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'edit.operators' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        {userOperator && userOperator.loading &&
          <Spinner isLoading={userOperator.loading} className="-light -fixed" />
        }

        {userOperator && !isEmpty(userOperator.data) &&
          <EditOperator
            operator={userOperator.data}
            onSubmit={this.handleOperatorEditSubmit}
          />
        }
      </Layout>
    );
  }
}

OperatorsEdit.propTypes = {
  intl: PropTypes.object.isRequired,
  url: PropTypes.object,
  user: PropTypes.object,
  userOperator: PropTypes.object,
  getOperators: PropTypes.func,
  getUserOperator: PropTypes.func
};

export default injectIntl(connect(
  state => ({
    user: state.user,
    userOperator: state.user.userOperator
  }),
  { getUserOperator, getOperators }
)(OperatorsEdit));
