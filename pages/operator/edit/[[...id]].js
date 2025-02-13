import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

// Next
import Link from 'next/link';

// Redux
import { connect } from 'react-redux';
import { getUserOperator } from 'modules/user';
import { getOperators } from 'modules/operators';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import EditOperator from 'components/operators/edit';
import Spinner from 'components/ui/spinner';

const OperatorsEdit = ({ userOperator, operatorId, getOperators, getUserOperator }) => {
  const intl = useIntl();

  if (!operatorId) {
    return null;
  }

  const handleOperatorEditSubmit = () => {
    getOperators();
    getUserOperator(operatorId);
  }

  return (
    <Layout
      title={intl.formatMessage({ id: 'edit.operators' })}
      description={intl.formatMessage({ id: 'edit.operators.description' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'edit.operators' })}
        background="/static/images/static-header/bg-help.jpg"
        Component={
          <Link href={`/operators/${userOperator.data.slug}/documentation`} className="c-button -secondary -small">
            {intl.formatMessage({ id: 'documentation' })}
          </Link>
        }
      />

      {userOperator && userOperator.loading &&
        <Spinner isLoading={userOperator.loading} className="-light -fixed" />
      }

      {userOperator && !isEmpty(userOperator.data) &&
        <EditOperator
          key={userOperator.data.id} // set key to rerender component whenever the data changes
          operator={userOperator.data}
          onSubmit={handleOperatorEditSubmit}
        />
      }
    </Layout>
  );
}

OperatorsEdit.getInitialProps = async ({ store, query }) => {
  const { user } = store.getState();

  if (!user.operator_ids) {
    return { errorCode: 404 };
  }

  if (query.id && !user.operator_ids.includes(Number(query.id))) {
    return { errorCode: 404 };
  }
  const operatorId = Number(query.id) || user.operator_ids[0];
  if (operatorId) {
    await store.dispatch(getUserOperator(operatorId));
  }
  return { operatorId };
}

OperatorsEdit.propTypes = {
  operatorId: PropTypes.number.isRequired,
  user: PropTypes.object,
  userOperator: PropTypes.object,
  getOperators: PropTypes.func,
  getUserOperator: PropTypes.func
};

export default connect(
  state => ({
    user: state.user,
    userOperator: state.user.userOperator
  }),
  { getUserOperator, getOperators }
)(OperatorsEdit);
