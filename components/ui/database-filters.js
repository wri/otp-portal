import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { injectIntl } from 'react-intl';
import Select from 'react-select';
import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';
import Filters from 'components/ui/filters';

class DatabaseFilters extends Filters {
  constructor(props) {
    super(props);
    // open "more filters" straight away when the url already filters by one of them
    this.state = {
      showMore: props.filtersRefs.some((f) => !f.primary && this.isActive(f.key, props.filters))
    };
  }

  isActive(key, filters = this.props.filters) {
    return !!(filters && filters[key] && filters[key].length);
  }

  clearAll = () => {
    const filter = {};
    this.props.filtersRefs.forEach((f) => { filter[f.key] = []; });
    this.props.setFilters(filter);
  }

  renderFiltersSelects(filtersRefs) {
    const { options, filters } = this.props;

    return filtersRefs.map((f) => {
      let opts = options[f.key];

      if (f.key === 'validation_status' && opts && opts.length) {
        opts = opts.map((o) => ({
          ...o,
          label: this.props.intl.formatMessage({
            id: `observations.status-${o.id}`,
          }),
          name: this.props.intl.formatMessage({
            id: `observations.status-${o.id}`,
          }),
        }));
      }

      if (f.key === 'status' && opts && opts.length) {
        opts = opts.map((o) => ({
          ...o,
          label: this.props.intl.formatMessage({
            id: `${o.id}`,
          }),
          name: this.props.intl.formatMessage({
            id: `${o.id}`,
          }),
        }));
      }

      if (f.key === 'source' && opts && opts.length) {
        const sourceSlugs = ['company', 'forest_atlas','other_source'];
        opts = opts.map((o) => ({
          ...o,
          label: this.props.intl.formatMessage({
            id: `${sourceSlugs[o.id - 1]}`,
          }),
          name: this.props.intl.formatMessage({
            id: `${sourceSlugs[o.id - 1]}`,
          }),
        }));
      }

      if (f.key === 'forest_types' && opts && opts.length) {
        opts = opts.map((o) => ({
          ...o,
          label: this.props.intl.formatMessage({
            id: `${o.key}`,
          }),
          name: this.props.intl.formatMessage({
            id: `${o.key}`,
          }),
        }));
      }


      const value = opts
      ? opts.filter((opt) =>
          filters[f.key] ? filters[f.key].includes(opt.value) : false
        )
      : [];


      return (
        <div key={f.key} className="field">
          <div className="c-select">
            <label className="title">
              {this.props.intl.formatMessage({ id: `filter.${f.key}` })}
            </label>

            <Select
              instanceId={f.key}
              name={f.key}
              options={opts}
              isMulti
              className='react-select-container'
              classNamePrefix='react-select'
              value={value}
              aria-label={this.props.intl.formatMessage({ id: `filter.${f.key}` })}
              placeholder={this.props.intl.formatMessage({
                id: `filter.${f.key}.placeholder`,
              })}
              onChange={(selected) => {
                this.setFilter(selected, f.key);
              }}
            />
          </div>
        </div>
      );
    });
  }

  render() {
    const { className, loading, filtersRefs, intl } = this.props;
    const { showMore } = this.state;

    const primaryRefs = filtersRefs.filter((f) => f.primary);
    const moreRefs = filtersRefs.filter((f) => !f.primary);
    const activeCount = filtersRefs.filter((f) => this.isActive(f.key)).length;
    const hiddenActiveCount = moreRefs.filter((f) => this.isActive(f.key)).length;

    return (
      <aside className={classnames('c-filters', className)}>
        <div className="l-container -wide">
          <div className="filters-panel">
            <Spinner isLoading={loading} />
            <div className="filters-header">
              <h2 className="filters-title">
                {intl.formatMessage({ id: 'filter.title' })}
              </h2>
              {activeCount > 0 && (
                <>
                  <span className="filters-badge">
                    {intl.formatMessage({ id: 'filter.active_count' }, { count: activeCount })}
                  </span>
                  <button type="button" className="filters-clear" onClick={this.clearAll}>
                    {intl.formatMessage({ id: 'filter.clear_all' })}
                  </button>
                </>
              )}
            </div>

            <div id="filters-grid" className="filters-grid">
              {this.renderFiltersSelects(showMore ? [...primaryRefs, ...moreRefs] : primaryRefs)}
              {moreRefs.length > 0 && (
                <button
                  type="button"
                  className="filters-more-btn"
                  aria-expanded={showMore}
                  aria-controls="filters-grid"
                  onClick={() => this.setState({ showMore: !showMore })}
                >
                  {intl.formatMessage({ id: showMore ? 'filter.fewer' : 'filter.more' })}
                  {!showMore && hiddenActiveCount > 0 && (
                    <span className="filters-more-count">{hiddenActiveCount}</span>
                  )}
                  <Icon name={showMore ? 'icon-arrow-up' : 'icon-arrow-down'} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    );
  }
}

DatabaseFilters.propTypes = {
  filters: PropTypes.object,
  filtersRefs: PropTypes.array,
  options: PropTypes.object,
  intl: PropTypes.object.isRequired,
  className: PropTypes.string,
  loading: PropTypes.bool,
  // Actions
  setFilters: PropTypes.func
};

DatabaseFilters.defaultProps = {
  options: {},
  loading: false
};

export default injectIntl(DatabaseFilters);
