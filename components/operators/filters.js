import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import orderBy from 'lodash/orderBy';

import modal from 'services/modal';

// Redux
import { connect } from 'react-redux';
import { setFilters } from 'modules/operators-ranking';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Select from 'react-select';
import Icon from 'components/ui/icon';
import RankingModal from 'components/ui/ranking-modal';

const FILTERS_REFS = [
  {
    key: 'country',
    name: 'filter.country',
    type: 'select',
    placeholder: 'filter.country.placeholder',
    translate: true,
    columns: 4
  },
  {
    key: 'certification',
    name: 'filter.certification',
    type: 'select',
    placeholder: 'filter.certification.placeholder',
    columns: 3
  },
  {
    key: 'operator',
    name: 'filter.operator',
    type: 'input',
    placeholder: 'search.operators',
    columns: 3
  },
  {
    key: 'fmu',
    name: 'fmu',
    type: 'input',
    placeholder: 'Search FMU',
    columns: 2
  }
];

class OperatorsFilters extends React.Component {
  static defaultProps = {
    className: ''
  };

  static propTypes = {
    intl: PropTypes.object.isRequired,
    filters: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string,
    setFilters: PropTypes.func
  };

  setSelect(opts, key) {
    const filter = {};
    filter[key] = opts.map(opt => opt.value || opt);
    this.props.setFilters(filter);
  }

  setSearch(value, key) {
    const filter = {};
    filter[key] = value;

    this.props.setFilters(filter);
  }

  renderFiltersSelects() {
    const { options, filters } = this.props;

    return FILTERS_REFS.map((f) => {
      const sortedOptions = orderBy(
        (options[f.key] || []).map(o => ({
          ...o,
          label: f.translate ? this.props.intl.formatMessage({ id: o.label }) : o.label
        })),
        (o) => o.label.toLowerCase()
      );
      const value = sortedOptions.filter(opt => filters[f.key]?.includes(opt.value));

      return (
        <div key={f.key} className={`columns medium-${f.columns} small-12`}>
          <div className="field">
            <div className="c-select">
              <label className="title">
                {this.props.intl.formatMessage({ id: f.name })}
              </label>

              {f.type === 'select' &&
                <Select
                  isMulti
                  instanceId={f.key}
                  name={f.key}
                  aria-label={this.props.intl.formatMessage({ id: f.name })}
                  options={sortedOptions}
                  className='react-select-container'
                  classNamePrefix='react-select'
                  value={value}
                  placeholder={this.props.intl.formatMessage({ id: f.placeholder })}
                  onChange={opts => this.setSelect(opts, f.key)}
                />
              }

              {f.type === 'input' &&
                <div className="search">
                  <input
                    type="search"
                    aria-label={this.props.intl.formatMessage({ id: f.name })}
                    placeholder={this.props.intl.formatMessage({ id: f.placeholder })}
                    className="search-input"
                    data-test-id={`search-input-${f.key}`}
                    value={filters[f.key]}
                    onChange={e => this.setSearch(e.currentTarget.value, f.key)}
                  />

                  {!!filters[f.key] &&
                    <button
                      className="search-remove"
                      onClick={() => {
                        this.setSearch('', f.key);
                      }}
                      aria-label="Clear search"
                    >
                      <Icon name="icon-cross" className="-smaller" />
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    const { className } = this.props;

    const classNames = classnames({
      [className]: !!className
    });

    return (
      <aside className={`c-filters-operators ${classNames}`}>
        <div className="filters-container">

          <h1 className="c-title -big -light">
            {this.props.intl.formatMessage({ id: 'transparency_ranking' })}

            <button
              className="c-button -clean"
              aria-label="Learn more about the ranking"
              onClick={() => {
                modal.toggleModal(true, {
                  children: RankingModal
                });
              }}
            >
              <Icon name="icon-info" className="-small" />
            </button>
          </h1>

          <div className="filters-content">
            <div className="l-row row">
              {this.renderFiltersSelects()}
            </div>
          </div>
        </div>
      </aside>
    );
  }
}


export default connect(
  state => ({
    filters: state.operatorsRanking.filters.data,
    options: state.operatorsRanking.filters.options
  }),
  {
    setFilters
  }
)(injectIntl(OperatorsFilters));
