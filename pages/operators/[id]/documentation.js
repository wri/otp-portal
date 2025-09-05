import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';
import { getParsedDocumentation } from 'selectors/operators-detail/documentation';

// Redux
import { connect } from 'react-redux';
import {
  getOperator,
  getOperatorDocumentation
} from 'modules/operators-detail';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailDocumentation from 'components/operators-detail/documentation';

const OperatorsDetailDocumentationPage = ({
  operatorsDetail,
  operatorObservations,
  operatorDocumentation,
  getOperatorDocumentation
}) => {
  const prevDateRef = useRef();

  useEffect(() => {
    const currentDate = operatorsDetail?.date?.toString();

    if (prevDateRef.current && prevDateRef.current !== currentDate) {
      const operator = operatorsDetail.data;
      getOperatorDocumentation(operator.id);
    }

    prevDateRef.current = currentDate;
  }, [operatorsDetail?.date, operatorsDetail.data, getOperatorDocumentation]);

  return (
    <Layout operatorObservations={operatorObservations}>
      <OperatorsDetailDocumentation
        operatorsDetail={operatorsDetail}
        operatorDocumentation={operatorDocumentation}
      />
    </Layout>
  );
};

OperatorsDetailDocumentationPage.getInitialProps = getInitialProps;

OperatorsDetailDocumentationPage.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  operatorDocumentation: PropTypes.array
};

export default connect(
  (state) => ({
    operatorsDetail: state.operatorsDetail,
    operatorObservations: getParsedObservations(state),
    operatorDocumentation: getParsedDocumentation(state)
  }),
  {
    getOperator,
    getOperatorDocumentation
  }
)(OperatorsDetailDocumentationPage);
