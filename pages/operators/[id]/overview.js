import React from 'react';
import PropTypes from 'prop-types';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';
import { getParsedDocumentation } from 'selectors/operators-detail/documentation';

// Redux
import { connect } from 'react-redux';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailOverview from 'components/operators-detail/overview';

export class OperatorsDetailOverviewPage extends React.Component {
  static getInitialProps = getInitialProps;

  render() {
    const {
      operatorsDetail,
      operatorObservations,
      operatorDocumentation,
    } = this.props;

    return (
      <Layout operatorObservations={operatorObservations}>
        <OperatorsDetailOverview
          operatorsDetail={operatorsDetail}
          operatorDocumentation={operatorDocumentation}
          operatorObservations={operatorObservations.filter(o => !o.hidden)}
        />
      </Layout>
    );
  }
}

OperatorsDetailOverviewPage.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  operatorDocumentation: PropTypes.array,
};

export default connect(
  (state) => ({
    operatorsDetail: state.operatorsDetail,
    operatorObservations: getParsedObservations(state),
    operatorDocumentation: getParsedDocumentation(state),
  }),
)(OperatorsDetailOverviewPage);
