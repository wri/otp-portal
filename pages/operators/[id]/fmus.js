import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';

// Components
import Layout, { getInitialProps } from 'components/operators-detail/layout';

// Operator Details Tabs
import OperatorsDetailFMUs from 'components/operators-detail/fmus';

// Selectors
import { getParsedObservations } from 'selectors/operators-detail/observations';

class OperatorsDetailFMUsPage extends React.Component {
  static getInitialProps = getInitialProps;

  render() {
    const {
      url,
      operatorsDetail,
      operatorObservations,
    } = this.props;

    return (
      <Layout url={url} operatorObservations={operatorObservations}>
        <OperatorsDetailFMUs operatorsDetail={operatorsDetail} url={url} />
      </Layout>
    );
  }
}

OperatorsDetailFMUsPage.propTypes = {
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array
};

export default connect(
  (state) => ({
    operatorsDetail: state.operatorsDetail,
    operatorObservations: getParsedObservations(state)
  })
)(OperatorsDetailFMUsPage);
