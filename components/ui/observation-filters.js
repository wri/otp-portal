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
      this.props.filtersRefs.map((f) => {
        const value = options[f.key]
          ? options[f.key].filter((opt) =>
              filters[f.key] ? filters[f.key].includes(opt.value) : false
            )
          : [];

        this.setFilter(value, f.key);
      });
    }
  }

  setFilter = (selected, key) => {
    const filter = {};
    filter[key] = [].concat(selected).map((opt) => {
      const isVal = opt?.value !== null && typeof opt?.value !== 'undefined';
      return isVal ? opt.value : opt;
    }).filter(val => val !== null && typeof val !== 'undefined');
    this.props.setFilters(filter);
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

    return (
      <div className="c-select">
        <h3 className="title">
          {this.props.intl.formatMessage({ id: `filter.${f.key}`, defaultMessage: f.name })}
        </h3>
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
    const title = this.props.intl.formatMessage({ id: `filter.${f.key}`, defaultMessage: f.name });
    const description = this.props.intl.formatMessage({ id: `filter.${f.key}.description`, defaultMessage: f.description });

    return (
      <div className="filter-checkbox">
        <h3 className="title">
          {title}
        </h3>
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
