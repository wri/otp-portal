import React from 'react';
import PropTypes from 'prop-types';

// Components
import Layout, { getInitialProps, useOperatorDetail } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailObservations from 'components/operators-detail/observations';

const ObservationsTab = () => {
  const { operatorsDetail, observations } = useOperatorDetail();

  return (
    <OperatorsDetailObservations
      operatorsDetail={operatorsDetail}
      operatorObservations={observations}
    />
  );
};

const OperatorsDetailObservationsPage = ({ operatorsDetail }) => (
  <Layout operatorsDetail={operatorsDetail}>
    <ObservationsTab />
  </Layout>
);

OperatorsDetailObservationsPage.getInitialProps = getInitialProps;

OperatorsDetailObservationsPage.propTypes = {
  operatorsDetail: PropTypes.object
};

export default OperatorsDetailObservationsPage;
