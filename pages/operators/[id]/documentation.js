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

import usePrevious from 'hooks/use-previous';

const OperatorsDetailDocumentationPage = ({
  operatorsDetail,
  operatorObservations,
  operatorDocumentation,
  getOperatorDocumentation
}) => {
  const date = operatorsDetail?.date?.toString();
  const previousDate = usePrevious(date);

  useEffect(() => {
    if (previousDate && previousDate !== date) {
      const operator = operatorsDetail.data;
      getOperatorDocumentation(operator.id);
    }
  }, [date, operatorsDetail.data, getOperatorDocumentation]);

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
