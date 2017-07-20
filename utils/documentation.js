import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

// Constants
import { PALETTE_COLOR_2 } from 'constants/rechart';

const PALETTE = {
  doc_not_provided: {
    name: 'Not provided',
    fill: PALETTE_COLOR_2[0].fill,
    stroke: PALETTE_COLOR_2[0].fill
  },
  doc_invalid: {
    name: 'Provided (not valid)',
    fill: PALETTE_COLOR_2[1].fill,
    stroke: PALETTE_COLOR_2[1].fill
  },
  doc_valid: {
    name: 'Provided (valid)',
    fill: PALETTE_COLOR_2[2].fill,
    stroke: PALETTE_COLOR_2[2].fill
  }
};


const HELPERS_DOC = {
  getGroupedByType(data) {
    return groupBy(data, 'type');
  },

  getGroupedByCategory(data) {
    return groupBy(data, 'category');
  },

  getGroupedByStatus(data) {
    return groupBy(data, 'status');
  },

  getGroupedByFmu(data) {
    return groupBy(data, d => d.fmu.name);
  },

  getGroupedByStatusChart(data) {
    if (data.length) {
      const length = data.length;
      const groupedByStatus = this.getGroupedByStatus(data);

      return flatten(Object.keys(groupedByStatus).map(status => [
        {
          name: PALETTE[status].name,
          value: Math.round((groupedByStatus[status].length / length) * 100) || 0,
          fill: PALETTE[status].fill,
          stroke: PALETTE[status].stroke
        }
      ]));
    }

    return [];
  },

  getPercentageOfValidDocumentation(data) {
    const grouped = this.getGroupedByStatus(data);
    return (grouped.doc_valid) ? ((grouped.doc_valid.length / data.length) * 100).toFixed(2) : 0;
  },

  getMaxLength(data) {
    const arr = Object.keys(data).map(k => data[k].length);
    return Math.max(...arr);
  }
};

export { HELPERS_DOC };
