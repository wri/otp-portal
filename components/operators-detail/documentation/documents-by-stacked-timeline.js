import React from 'react';
import PropTypes from 'prop-types';

// Redux
import { connect } from 'react-redux';
import { getDocuments } from 'modules/operators-detail';
import { getAllParsedDocumentation } from 'selectors/operators-detail/documentation';


import StackedTimeline from 'components/ui/stacked-timeline';

// Components
import Spinner from 'components/ui/spinner';

class DocumentsStackedTimeline extends React.Component {
  state = {
    loading: true
  };

  componentDidMount() {
    const { id } = this.props;

    this.props.getDocuments(id);

    if (this.props.documentation.length) {
      this.drawChart(this.props.documentation);
    }
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.documentation.length !== this.props.documentation.length) {
      this.drawChart(nextProps.documentation);
    }
  }

  componentWillUnmount() {
    delete this.chartInstance;
  }

  drawChart(data) {
    const selector = '#chart-stacked-timeline';
    // remove current chart if it exists
    this.setState({
      loading: false
    });

    document.querySelector(selector).innerHTML = '';

    this.chartInstance = new StackedTimeline(selector, data);
  }

  render() {
    return (
      <div className="c-stacked-timeline" id="chart-stacked-timeline">
        <Spinner className="-transparent -small" isLoading={this.state.loading} />
      </div>
    );
  }
}

DocumentsStackedTimeline.propTypes = {
  id: PropTypes.string,
  documentation: PropTypes.array,
  getDocuments: PropTypes.func
};

export default connect(
  state => ({
    documentation: getAllParsedDocumentation(state)
  }),
  { getDocuments }
)(DocumentsStackedTimeline);
