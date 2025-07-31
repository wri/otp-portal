import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { injectIntl } from 'react-intl';
import Select from 'react-select';

import Checkbox from 'components/form/Checkbox';
import Spinner from 'components/ui/spinner';
import Filters from 'components/ui/filters';

class ObservationFilters extends Filters {
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
          <label className="title">
            {title}
          </label>
        )}
        <Select
          instanceId={f.key}
          name={f.key}
          options={opts}
          isMulti
          className='react-select-container'
          classNamePrefix='react-select'
          value={value}
          aria-label={title}
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
    const { options, filters } = this.props;
    const title = f.name && this.props.intl.formatMessage({ id: `filter.${f.key}`, defaultMessage: f.name });
    const description = this.props.intl.formatMessage({ id: `filter.${f.key}.description`, defaultMessage: f.description });
    const value = options[f.key]?.some((opt) => filters[f.key]?.includes(opt.value));

    return (
      <div className="filter-checkbox">
        {title && (
          <label className="title">
            {title}
          </label>
        )}
        <Checkbox
          properties={{ title: description, className: '-white', checked: value, value }}
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

ObservationFilters.propTypes = {
  filters: PropTypes.object,
  filtersRefs: PropTypes.array,
  loading: PropTypes.bool,
  options: PropTypes.object,
  intl: PropTypes.object.isRequired,
  className: PropTypes.string,
  // Actions
  setFilters: PropTypes.func
};

ObservationFilters.defaultProps = {
  options: {},
};

export default injectIntl(ObservationFilters);
