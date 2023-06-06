import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { getOperator } from 'modules/operators-detail';

// Intl
import { injectIntl } from 'react-intl';

class RankingModal extends React.Component {
  render() {
    return (
      <div className="c-ranking-modal">
        <p>
          {this.props.intl.formatMessage({ id: 'transparency_ranking.description' })}
        </p>
      </div>
    );
  }
}

RankingModal.propTypes = {
  intl: PropTypes.object.isRequired
};


export default injectIntl(connect(
  null,
  { getOperator }
)(RankingModal));
