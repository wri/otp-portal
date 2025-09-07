import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

// Next
import Router from 'next/router';
import Link from 'next/link';

// Redux
import { useDispatch } from 'react-redux';
import { getUserOperator } from 'modules/user';
import { getOperators } from 'modules/operators';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import EditOperator from 'components/operators/edit';
import Spinner from 'components/ui/spinner';
import useUser from 'hooks/use-user';

function OperatorsEdit({ operatorId }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const user = useUser();
  const userOperator = user.userOperator;
  useEffect(() => {
    if (!user.operator_ids) {
      const location = {
        pathname: '/'
      };
      Router.push(location, '/');
    }
  }, [user.operator_ids]);

  const handleOperatorEditSubmit = () => {
    dispatch(getOperators());
    dispatch(getUserOperator(operatorId));
  };

  if (!operatorId) {
    return null;
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
          onSubmit={handleOperatorEditSubmit}
        />
      }
    </Layout>
  );
}

OperatorsEdit.getInitialProps = async ({ store, query }) => {
  const { user } = store.getState();

  if (query.id && !user.operator_ids.includes(Number(query.id))) {
    return { redirectTo: '/' };
  }
  const operatorId = Number(query.id) || user.operator_ids[0];
  if (operatorId) {
    await store.dispatch(getUserOperator(operatorId));
  }
  return { operatorId };
};

OperatorsEdit.propTypes = {
  operatorId: PropTypes.number.isRequired
};

export default OperatorsEdit;
