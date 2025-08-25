import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Layout from 'components/layout/layout';
import StaticHeader from 'components/ui/static-header';
import NewOperator from 'components/operators/new';

const OperatorsNew = ({ intl }) => {
  return (
    <Layout
      title={intl.formatMessage({ id: 'new.operators' })}
      description={intl.formatMessage({ id: 'new.operators.description' })}
    >
      <StaticHeader
        title={intl.formatMessage({ id: 'new.operators' })}
        background="/static/images/static-header/bg-help.jpg"
      />

      <NewOperator />
    </Layout>
  );
};

OperatorsNew.propTypes = {
  intl: PropTypes.object.isRequired
};

export default injectIntl(OperatorsNew);
