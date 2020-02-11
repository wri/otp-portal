import React from 'react';
import isEmpty from 'lodash/isEmpty';

// Next
import Router from 'next/router';

// Redux
import { connect } from 'react-redux';
import { getOperators } from 'modules/operators';
import { getUserOperator } from 'modules/user';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import EditOperator from 'components/operators/edit';
import Spinner from 'components/ui/spinner';

class OperatorsEdit extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { operators, user } = this.props;

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }

    // // Get user operator
    if (user.operator) {
      this.props.getUserOperator(user.operator);
    }

    if (!user.operator) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }

  componentWillReceiveProps(nextProps) {
    // // Get user operator
    if (!nextProps.user.operator) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }

  render() {
    const { url, user, userOperator } = this.props;

    if (!user.operator) {
      return null;
    }

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'edit.operators' })}
        description={this.props.intl.formatMessage({ id: 'edit.operators.description' })}
        url={url}
        searchList={this.props.operators.data}
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
          />
        }
      </Layout>
    );
  }
}

OperatorsEdit.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(connect(

  state => ({
    user: state.user,
    operators: state.operators,
    userOperator: state.user.userOperator
  }),
  { getOperators, getUserOperator }
)(OperatorsEdit)));
