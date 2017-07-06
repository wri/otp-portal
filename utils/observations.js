import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

const HELPERS = {
  getGroupedByYear(data) {
    return groupBy(data, d => d.date.getFullYear());
  },

  getGroupedByCategory(data, year) {
    if (year) {
      const groupedByYear = this.getGroupedByYear(data);
      return groupBy(groupedByYear[year], 'category');
    }
    return groupBy(data, 'category');
  },

  getGroupedBySeverity(data, raw) {
    const grouped = groupBy(data, 'severity');
    if (raw) {
      return grouped;
    }
    return [{
      hight: (grouped[3]) ? grouped[3].length : 0,
      medium: (grouped[2]) ? grouped[2].length : 0,
      low: (grouped[1]) ? grouped[1].length : 0,
      unknown: (grouped[0]) ? grouped[0].length : 0
    }];
  },

  getGroupedByIllegality(data) {
    return groupBy(data, 'illegality');
  },

  getMaxValue(data) {
    const arr = flatten(Object.keys(data || this.props.data).map((k) => {
      const groupedBySeverity = groupBy(data[k], 'severity');
      return Object.keys(groupedBySeverity).map(s => groupedBySeverity[s].length);
    }));

    return Math.max(...arr);
  },

  getMaxLength(data) {
    const arr = Object.keys(data).map(k => data[k].length);
    return Math.max(...arr);
  },

  getAvgObservationByMonitors(data) {
    const dates = groupBy(data.map(o =>
      o.date.toJSON().slice(0, 10).replace(/-/g, '/')
    ));

    const avg = Object.keys(dates).reduce((sum, k) =>
      sum + dates[k].length, 0) / (Object.keys(dates).length || 1
    );
    return avg.toFixed(1);
  }
};

export { HELPERS };
