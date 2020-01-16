import React from 'react';

// Redux
import { connect } from 'react-redux';
import { store } from 'store';
import { getOperators } from 'modules/operators';
import withTracker from 'components/layout/with-tracker';

// Intl
import withIntl from 'hoc/with-intl';
import { intlShape } from 'react-intl';

// Components
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import NewOperator from 'components/operators/new';

class OperatorsNew extends Page {
  /**
   * COMPONENT LIFECYCLE
  */
  componentDidMount() {
    const { operators } = this.props;

    if (!operators.data.length) {
      // Get operators
      this.props.getOperators();
    }
  }

  render() {
    const { url } = this.props;

    return (
      <Layout
        title={this.props.intl.formatMessage({ id: 'new.operators' })}
        description={this.props.intl.formatMessage({ id: 'new.operators.description' })}
        url={url}
        searchList={this.props.operators.data}
      >
        <StaticHeader
          title={this.props.intl.formatMessage({ id: 'new.operators' })}
          background="/static/images/static-header/bg-help.jpg"
        />

        <NewOperator />

      </Layout>
    );
  }
}

OperatorsNew.propTypes = {
  intl: intlShape.isRequired
};


export default withTracker(withIntl(connect(

  state => ({
    operators: state.operators
  }),
  { getOperators }
)(OperatorsNew)));
