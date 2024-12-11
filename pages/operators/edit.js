import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

// Next
import Router from 'next/router';
import Link from 'next/link';

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
  static async getInitialProps({ store, query }) {
    const { user } = store.getState();

    if (query.id && !user.operator_ids.includes(Number(query.id))) {
      return { errorCode: 404 };
    }
    const operatorId = Number(query.id) || user.operator_ids[0];
    if (operatorId) {
      await store.dispatch(getUserOperator(operatorId));
    }
    return { operatorId };
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
    this.props.getUserOperator(this.props.operatorId);
  }

  render() {
    const { userOperator, operatorId, intl } = this.props;

    if (!operatorId) {
      return null;
    }

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'edit.operators' })}
        description={this.props.intl.formatMessage({ id: 'edit.operators.description' })}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'edit.operators' })}
          background="/static/images/static-header/bg-help.jpg"
          Component={
            <Link
              href={`/operators/${userOperator.data.slug}/documentation`}
              className="c-button -secondary -small">

              {intl.formatMessage({ id: 'documentation' })}

            </Link>
          }
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
  operatorId: PropTypes.number.isRequired,
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
