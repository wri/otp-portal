import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Next
import Link from 'next/link';

// Intl
import { useIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import EditOperator from 'components/operators/edit';
import Spinner from 'components/ui/spinner';

import { fetchUserOperator } from 'services/user';
import { reloadOperators } from 'services/resources';

const OperatorsEdit = ({ operatorId, operator: initialOperator }) => {
  const intl = useIntl();
  const [reloaded, setReloaded] = useState(null);
  const [loading, setLoading] = useState(false);
  // a save reloads the operator; props win again once they are for another operator
  const operator = reloaded && reloaded.id === initialOperator?.id ? reloaded : initialOperator;

  if (!operatorId) {
    return null;
  }

  const handleOperatorEditSubmit = () => {
    reloadOperators(intl.locale);
    setLoading(true);
    fetchUserOperator(operatorId, intl.locale)
      .then(setReloaded, console.error)
      .finally(() => setLoading(false));
  };

  return (
    <Layout
      title={intl.formatMessage({ id: 'edit.operators' })}
      description={intl.formatMessage({ id: 'edit.operators.description' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'edit.operators' })}
        background="/static/images/static-header/bg-help.jpg"
        Component={
          operator && (
            <Link href={`/operators/${operator.slug}/documentation`} className="c-button -secondary -small">
              {intl.formatMessage({ id: 'documentation' })}
            </Link>
          )
        }
      />

      <Spinner isLoading={loading} className="-light -fixed" />

      {operator && (
        <EditOperator
          key={operator.id} // a new form for another operator
          operator={operator}
          onSubmit={handleOperatorEditSubmit}
        />
      )}
    </Layout>
  );
}

OperatorsEdit.getInitialProps = async ({ user, query, language }) => {
  if (!user.operator_ids) {
    return { redirectTo: '/' };
  }

  if (query.id && !user.operator_ids.includes(Number(query.id))) {
    return { statusCode: 404 };
  }
  const operatorId = Number(query.id) || user.operator_ids[0];
  if (!operatorId) return {};

  const operator = await fetchUserOperator(operatorId, language).catch((error) => {
    console.error(error);
    return null;
  });
  return { operatorId, operator };
}

OperatorsEdit.propTypes = {
  operatorId: PropTypes.number,
  operator: PropTypes.object
};

export default OperatorsEdit;
