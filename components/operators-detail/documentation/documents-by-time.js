import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';

import Gantt from 'components/ui/gantt';

// Utils
import { HELPERS_DOC } from 'utils/documentation';


class DocumentsByTime extends React.Component {

  componentDidMount() {
    const { data } = this.props;
    console.log();

    const docs = data.filter(d => d.status !== 'doc_not_provided').map(d => ({
      title: d.title,
      status: d.status,
      startDate: new Date(d.startDate),
      endDate: new Date(d.endDate)
    }));

    const status = {
      doc_valid: '-doc_valid',
      doc_pending: '-doc_pending',
      doc_invalid: '-doc_invalid',
      doc_expired: '-doc_expired'
    };

    const titles = Object.keys(groupBy(docs, 'title'));

    const format = '%m/%Y';

    requestAnimationFrame(() => {
      const ganttInstance = new Gantt('#chart-gantt')
      ganttInstance.setTitles(titles);
      ganttInstance.setStatus(status);
      ganttInstance.setTimeFormat(format);
      ganttInstance.setHeight(titles.length * 40);
      ganttInstance.gantt(docs);
    });
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className="c-gantt" id="chart-gantt" style={{ width: '100%', height: 200 }} />
    );
  }
}

DocumentsByTime.defaultProps = {
  data: []
};

DocumentsByTime.propTypes = {
  data: PropTypes.array
};

export default DocumentsByTime;