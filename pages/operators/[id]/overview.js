import React from 'react';
import PropTypes from 'prop-types';

// Components
import Layout, { getInitialProps, useOperatorDetail } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailOverview from 'components/operators-detail/overview';

const OverviewTab = () => {
  const { operatorsDetail, observations, documentation } = useOperatorDetail();

  return (
    <OperatorsDetailOverview
      operatorsDetail={operatorsDetail}
      operatorDocumentation={documentation}
      operatorObservations={observations.filter(o => !o.hidden)}
    />
  );
};

export const OperatorsDetailOverviewPage = ({ operatorsDetail }) => (
  <Layout operatorsDetail={operatorsDetail}>
    <OverviewTab />
  </Layout>
);

OperatorsDetailOverviewPage.getInitialProps = getInitialProps;

OperatorsDetailOverviewPage.propTypes = {
  operatorsDetail: PropTypes.object
};

export default OperatorsDetailOverviewPage;
