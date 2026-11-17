import React from 'react';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';

// Redux
import { useSelector } from 'react-redux';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailObservations from 'components/operators-detail/observations';

const OperatorsDetailObservationsPage = () => {
  const operatorsDetail = useSelector((state) => state.operatorsDetail);
  const operatorObservations = useSelector(getParsedObservations);
  return (
    <Layout operatorObservations={operatorObservations}>
      <OperatorsDetailObservations
        operatorsDetail={operatorsDetail}
        operatorObservations={operatorObservations}
      />
    </Layout>
  );
};

OperatorsDetailObservationsPage.getInitialProps = getInitialProps;

export default OperatorsDetailObservationsPage;
