import React from 'react';
import PropTypes from 'prop-types';

// Chart
import RankingChart from 'components/ui/ranking-chart';

class OperatorsRanking extends React.Component {

  componentDidMount() {
    const { data } = this.props;

    requestAnimationFrame(() => {
      const ranking = new RankingChart('#operators-ranking');
      ranking.draw(data);
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div id="operators-ranking" className="c-ranking-chart" />
    );
  }
}

OperatorsRanking.defaultProps = {
  data: []
};

OperatorsRanking.propTypes = {
  data: PropTypes.array
};

export default OperatorsRanking;
