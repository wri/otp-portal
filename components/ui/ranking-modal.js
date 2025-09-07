import React from 'react';
import PropTypes from 'prop-types';

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


export default RankingModal;
