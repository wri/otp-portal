import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { injectIntl, intlShape } from 'react-intl';
import Select from 'react-select';
import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';
import Filters from 'components/ui/filters';

class DatabaseFilters extends Filters {
  constructor(props) {
    super(props);
    this.state = { open: true };
  }

  renderFiltersSelects() {
    const { options, filters, filtersRefs } = this.props;

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
            <h3 className="title">
              {this.props.intl.formatMessage({ id: `filter.${f.key}` })}
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
    const { className, loading } = this.props;

    const classNames = classnames({
      [className]: !!className,
    });

    return (
      <aside className={`c-filters ${classNames}`}>
        <div className="filters-content">
          <div className="l-container">
            <div className="row l-row">
              <div className="columns small-12">
                <h2 className="c-title">
                  {this.props.intl.formatMessage({ id: 'filter.title' })}
                  <button
                    className={`filters-toggle-btn${
                      this.state.open ? ' -green' : ''
                    }`}
                    onClick={() => this.setState({ open: !this.state.open })}
                  >
                    {this.state.open ? (
                      <Icon name="icon-arrow-up" />
                    ) : (
                      <Icon name="icon-arrow-down" />
                    )}
                  </button>
                </h2>
              </div>
            </div>
          </div>
          {this.state.open && (
            <div className="filters-wrapper">
              <Spinner isLoading={loading} />
              <div className="l-container">
                <div className="row l-row">
                  <div className="columns small-12 flex-wrapper">
                    {this.renderFiltersSelects()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }
}

DatabaseFilters.propTypes = {
  filters: PropTypes.object,
  filtersRefs: PropTypes.array,
  options: PropTypes.object,
  intl: intlShape.isRequired,
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
