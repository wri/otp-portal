import React from 'react';
import PropTypes from 'prop-types';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';

// Redux
import { connect } from 'react-redux';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailObservations from 'components/operators-detail/observations';

const OperatorsDetailObservationsPage = ({
  operatorsDetail,
  operatorObservations
}) => {
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

OperatorsDetailObservationsPage.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
};

export default connect(
  (state) => ({
    operatorsDetail: state.operatorsDetail,
    operatorObservations: getParsedObservations(state),
  })
)(OperatorsDetailObservationsPage);
