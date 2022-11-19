import React from 'react';
import PropTypes from 'prop-types';

// Chart
import RankingChart from 'components/ui/ranking-chart';

class OperatorsRanking extends React.Component {

  componentDidMount() {
    const { data, sortDirection } = this.props;

    requestAnimationFrame(() => {
      this.ranking = new RankingChart('#operators-ranking');
      this.ranking.draw(data, sortDirection);
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.sortDirection !== this.props.sortDirection) {
      this.ranking.draw(this.props.data, nextProps.sortDirection);
    }
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
  data: [],
  sortDirection: -1
};

OperatorsRanking.propTypes = {
  data: PropTypes.array,
  sortDirection: PropTypes.number
};

export default OperatorsRanking;
