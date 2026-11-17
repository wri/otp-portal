import React from 'react';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';
import { getParsedDocumentation } from 'selectors/operators-detail/documentation';

// Redux
import { useSelector } from 'react-redux';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailOverview from 'components/operators-detail/overview';

export const OperatorsDetailOverviewPage = () => {
  const operatorsDetail = useSelector((state) => state.operatorsDetail);
  const operatorObservations = useSelector(getParsedObservations);
  const operatorDocumentation = useSelector(getParsedDocumentation);
  return (
    <Layout operatorObservations={operatorObservations}>
      <OperatorsDetailOverview
        operatorsDetail={operatorsDetail}
        operatorDocumentation={operatorDocumentation}
        operatorObservations={operatorObservations.filter(o => !o.hidden)}
      />
    </Layout>
  );
};

OperatorsDetailOverviewPage.getInitialProps = getInitialProps;

export default OperatorsDetailOverviewPage;
