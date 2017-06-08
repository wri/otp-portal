import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';


// Provisional
const options = {
  type: [{ label: 'type1', value: 'type1' }, { label: 'type2', value: 'type2' }],
  country: [{ label: 'country1', value: 'country1' }, { label: 'country2', value: 'country2' }]
};


export default class Filters extends React.Component {
  setFilter(opts, key) {
    const filter = {};
    filter[key] = opts.map(opt => opt.value || opt);
    this.props.setFilters(filter);
  }

  renderFiltersSelects() {
    return Object.keys(options).map((key, i) => {
      const value = options[key] ?
        options[key].filter(opt => this.props.filters[key] ?
          this.props.filters[key].includes(opt.value) :
          false) :
        [];

      return (
        <div key={i} className="field">
          <h3 className="title">{key}</h3>
          <Select
            instanceId={key}
            name={key}
            options={options[key]}
            multi
            className={value.length ? '-filled' : ''}
            value={value}
            placeholder={`All ${key}`}
            onChange={opts => this.setFilter(opts, key)}
          />
        </div>
      );
    });
  }

  render() {
    return (
      <aside className="c-filters">
        <div className="filters-content">
          <h2 className="c-title -light">Filter by</h2>
          {this.renderFiltersSelects()}
        </div>
      </aside>
    );
  }
}

Filters.propTypes = {
  filters: PropTypes.object,
  onChange: PropTypes.any,
  options: PropTypes.object,
  // Actions
  setFilters: PropTypes.func
};

Filters.defaultProps = {
  options: {}
};
