import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';

// Redux
import { connect } from 'react-redux';
import { getDocuments } from 'modules/operators-detail';
import { getAllParsedDocumentation } from 'selectors/operators-detail/documentation';


import Gantt from 'components/ui/gantt';

class DocumentsByTime extends React.Component {

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

  shouldComponentUpdate() {
    return false;
  }

  drawChart(data) {
    const selector = '#chart-gantt';
    // remove current chart if it exists
    document.querySelector(selector).innerHTML = '';

    const status = {
      doc_valid: '-doc_valid',
      doc_pending: '-doc_pending',
      doc_invalid: '-doc_invalid',
      doc_expired: '-doc_expired'
    };

    const titles = Object.keys(groupBy(data, 'title'));
    const format = '%m/%Y';

    requestAnimationFrame(() => {
      const ganttInstance = new Gantt(selector);
      ganttInstance.setTitles(titles);
      ganttInstance.setStatus(status);
      ganttInstance.setTimeFormat(format);
      ganttInstance.setHeight(titles.length * 40);
      ganttInstance.gantt(data);
    });
  }

  render() {
    return (
      <div className="c-gantt" id="chart-gantt" />
    );
  }
}

DocumentsByTime.defaultProps = {

};

DocumentsByTime.propTypes = {
  id: PropTypes.string,
  documentation: PropTypes.array,
  getDocuments: PropTypes.func
};

export default connect(
  state => ({
    documentation: getAllParsedDocumentation(state)
  }),
  { getDocuments }
)(DocumentsByTime);
