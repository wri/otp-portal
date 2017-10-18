import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import { connect } from 'react-redux';
import { setFilters } from 'modules/operators-ranking';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Components
import Select from 'react-select';

const FILTERS_REFS = [
  {
    key: 'country',
    name: 'Country',
    placeholder: 'All Countries'
  },
  {
    key: 'certification',
    name: 'Certifications',
    placeholder: 'All certifications'
  }
];

class OperatorsFilters extends React.Component {
  static defaultProps = {
    className: ''
  };

  static propTypes = {
    intl: intlShape.isRequired,
    filters: PropTypes.object,
    options: PropTypes.object,
    className: PropTypes.string,
    setFilters: PropTypes.func
  };

  setFilter(opts, key) {
    const filter = {};
    filter[key] = opts.map(opt => opt.value || opt);
    this.props.setFilters(filter);
  }

  renderFiltersSelects() {
    const { options, filters } = this.props;

    return FILTERS_REFS.map((f) => {
      const value = options[f.key] ?
        options[f.key].filter(opt => filters[f.key] ?
          filters[f.key].includes(opt.value) :
          false) :
        [];

      return (
        <div key={f.key} className="columns medium-6 small-12">
          <div className="field">
            <div className="c-select">
              <h3 className="title">
                {this.props.intl.formatMessage({ id: `filter.${f.key}` })}
              </h3>
              <Select
                multi
                instanceId={f.key}
                name={f.key}
                options={options[f.key]}
                className={value.length ? '-filled' : ''}
                value={value}
                placeholder={this.props.intl.formatMessage({ id: `filter.${f.key}.placeholder` })}
                onChange={opts => this.setFilter(opts, f.key)}
              />
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

          <h3 className="c-title -big -light">
            Transparency Ranking
          </h3>

          <p>
            This ranking is based on the full list of registered operators in a country. The ranking score is displayed as a percentage. The score represents the percentage of documents available for each company on this site, out of the total number of documents requested. The other columns show which forest  certifications a company holds, and the average number of observations per visit by third-party forest monitors. The filter tool allows you to display the ranking for different geographies, and for companies that are certified with a particular scheme.
          </p>

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
