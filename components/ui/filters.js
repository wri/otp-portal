import React from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';

class Filters extends React.Component {
  componentDidUpdate(prevProps) {
    const { options, filters } = this.props;
    const { options: prevOptions } = prevProps;

    if (!isEqual(options, prevOptions)) {
      const filter = {};
      // the below one will eliminate all selected filters that are missing options
      // for example when someone selected producer first, and country later and that producer was from different country
      this.props.filtersRefs.forEach((f) => {
        const value = (options[f.key] || []).filter((opt) => (filters[f.key] || []).includes(opt.value));
        filter[f.key] = this.getFilter(value);
      });
      this.props.setFilters(filter);
    }
  }

  getFilter(selected) {
    if (selected === undefined || selected === null) return [];

    return [].concat(selected).map((opt) => {
        const isVal = opt.value !== null && typeof opt.value !== 'undefined';
      return isVal ? opt.value : opt;
    });
  }

  setFilter(selected, key) {
    this.props.setFilters({
      [key]: this.getFilter(selected)
    });
  }
}

Filters.propTypes = {
  filters: PropTypes.object,
  filtersRefs: PropTypes.array,
  loading: PropTypes.bool,
  options: PropTypes.object,
  className: PropTypes.string,
  // Actions
  setFilters: PropTypes.func
};

Filters.defaultProps = {
  options: {},
};

export default Filters;
