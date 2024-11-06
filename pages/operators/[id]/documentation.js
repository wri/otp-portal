import React from 'react';
import PropTypes from 'prop-types';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';
import { getParsedDocumentation } from 'selectors/operators-detail/documentation';
import { getParsedTimeline } from 'selectors/operators-detail/timeline';

// Redux
import { connect } from 'react-redux';
import {
  getOperator,
  getOperatorDocumentation,
  getOperatorDocumentationCurrent,
} from 'modules/operators-detail';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailDocumentation from 'components/operators-detail/documentation';

class OperatorsDetailDocumentationPage extends React.Component {
  static getInitialProps = getInitialProps;

  componentDidUpdate(prevProps) {
    const prevDate = prevProps?.operatorsDetail?.date?.toString();
    const newDate = this.props?.operatorsDetail?.date?.toString();

    if (prevDate !== newDate) {
      const { url, operatorsDetail } = this.props;
      const operator = operatorsDetail.data;
      this.props.getOperatorDocumentation(operator.id);
      this.props.getOperatorDocumentationCurrent(operator.id);
    }
  }

  render() {
    const {
      url,
      operatorsDetail,
      operatorObservations,
      operatorDocumentation,
      operatorTimeline,
    } = this.props;

    return (
      <Layout url={url} operatorObservations={operatorObservations}>
        <OperatorsDetailDocumentation
          operatorsDetail={operatorsDetail}
          operatorDocumentation={operatorDocumentation}
          operatorTimeline={operatorTimeline}
          url={url}
        />
      </Layout>
    );
  }
}

OperatorsDetailDocumentationPage.propTypes = {
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  operatorDocumentation: PropTypes.array,
  operatorTimeline: PropTypes.array,
};

export default connect(
  (state) => ({
    user: state.user,
    operatorsDetail: state.operatorsDetail,
    operatorObservations: getParsedObservations(state),
    operatorDocumentation: getParsedDocumentation(state),
    operatorTimeline: getParsedTimeline(state),
  }),
  {
    getOperator,
    getOperatorDocumentation,
    getOperatorDocumentationCurrent,
  }
)(OperatorsDetailDocumentationPage);
