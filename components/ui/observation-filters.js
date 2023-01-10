import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isEqual from 'lodash/isEqual';

import { injectIntl, intlShape } from 'react-intl';
import Select from 'react-select';

import Checkbox from 'components/form/Checkbox';
import Spinner from 'components/ui/spinner';

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

  renderFilterSelect = (f) => {
    const { options, filters } = this.props;

    const value = options[f.key]
      ? options[f.key].filter((opt) =>
        filters[f.key] ? filters[f.key].includes(opt.value) : false
      )
      : [];

    let opts = options[f.key];

    if (f.key === 'validation_status') {
      opts = (opts || []).map((o) => ({
        ...o,
        label: this.props.intl.formatMessage({
          id: `observations.status-${o.id}`,
        }),
        name: this.props.intl.formatMessage({
          id: `observations.status-${o.id}`,
        }),
      }));
    }
    if (f.key === 'observation_type') {
      opts = (opts || []).map((o) => ({
        ...o,
        label: this.props.intl.formatMessage({ id: o.id }),
        name: this.props.intl.formatMessage({ id: o.id })
      }));
    }
    if (f.key === 'severity_level') {
      const levelSlugs = ['unknown', 'low', 'medium', 'high'];
      opts = (opts || []).map((o) => ({
        ...o,
        label: this.props.intl.formatMessage({ id: levelSlugs[o.id] }),
        name: this.props.intl.formatMessage({ id: levelSlugs[o.id] })
      }));
    }

    const title = f.name && this.props.intl.formatMessage({ id: `filter.${f.key}`, defaultMessage: f.name });

    return (
      <div className="c-select">
        {title && (
          <h3 className="title">
            {title}
          </h3>
        )}
        <Select
          instanceId={f.key}
          name={f.key}
          options={opts}
          multi
          className={value.length ? '-filled' : ''}
          value={value}
          placeholder={this.props.intl.formatMessage({
            id: `filter.${f.key}.placeholder`,
            defaultMessage: f.placeholder
          })}
          onChange={(selected) => {
            this.setFilter(selected, f.key);
          }}
        />
      </div>
    )
  }

  renderFilterCheckbox = (f) => {
    const title = f.name && this.props.intl.formatMessage({ id: `filter.${f.key}`, defaultMessage: f.name });
    const description = this.props.intl.formatMessage({ id: `filter.${f.key}.description`, defaultMessage: f.description });

    return (
      <div className="filter-checkbox">
        {title && (
          <h3 className="title">
            {title}
          </h3>
        )}
        <Checkbox
          properties={{ title: description, className: '-white' }}
          onChange={({ checked }) => this.setFilter(f.valueTransform ? f.valueTransform(checked) : checked, f.key) }
        />
      </div>
    )
  }

  renderFilters() {
    return this.props.filtersRefs.map((f) => {
      return (
        <div key={f.key} className="field">
          {(f.type === 'select' || f.type === undefined) && this.renderFilterSelect(f)}
          {f.type === 'checkbox' && this.renderFilterCheckbox(f)}
        </div>
      );
    });
  }

  render() {
    const { className, loading } = this.props;

    const classNames = classnames({
      [className]: !!className,
    });

    return (
      <aside className={`c-observation-filters ${classNames}`}>
        <Spinner isLoading={loading} className="-absolute" />
        <div className="filters-content">
          <h2 className="c-title -light">
            {this.props.intl.formatMessage({ id: 'filter.title' })}
          </h2>
          {this.renderFilters()}
        </div>
      </aside>
    );
  }
}

Filters.propTypes = {
  filters: PropTypes.object,
  filtersRefs: PropTypes.array,
  loading: PropTypes.bool,
  options: PropTypes.object,
  intl: intlShape.isRequired,
  className: PropTypes.string,
  // Actions
  setFilters: PropTypes.func
};

Filters.defaultProps = {
  options: {},
};

export default injectIntl(Filters);
