import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { getOperator } from 'modules/operators-detail';

// Intl
import { useIntl } from 'react-intl';

const RankingModal = () => {
  const intl = useIntl();
  return (
    <div className="c-ranking-modal">
      <p>
        {intl.formatMessage({ id: 'transparency_ranking.description' })}
      </p>
    </div>
  );
};

RankingModal.propTypes = {};


export default connect(
  null,
  { getOperator }
)(RankingModal);
