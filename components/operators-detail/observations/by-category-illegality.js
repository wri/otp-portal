import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// components
import Table from 'components/ui/table';

const MAX_ROWS_TABLE_ILLEGALITIES = 10;

class TotalObservationsByOperatorByCategorybyIlegallity extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: {},
      indexPagination: 0
    };

    // BINDINGS
    this.triggerSelectedIllegality = this.triggerSelectedIllegality.bind(this);
  }

  /**
   * UI EVENTS
   * - triggerSelectedIllegality
  */
  triggerSelectedIllegality({ category, illegality, year }) {
    const { selected } = this.state;

    // Toggle selected
    if (selected.category === category &&
        selected.illegality === illegality &&
        selected.year === year
    ) {
      this.setState({
        indexPagination: 0,
        selected: {}
      });
    } else {
      this.setState({
        indexPagination: 0,
        selected: {
          category,
          illegality,
          year
        }
      });
    }
  }

  render() {
    const { selected } = this.state;
    const { data, year } = this.props;
    const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data, year);

    return (
      <div className="c-observations-by-illegality">
        {/* Charts */}
        <ul className="obi-category-list">
          {Object.keys(groupedByCategory).map((category) => {
            const groupedByIllegality = HELPERS_OBS.getGroupedByIllegality(groupedByCategory[category]);

            return (
              <li key={category} className="obi-category-list-item">
                <div className="l-container">
                  <h3 className="c-title -default -proximanova -uppercase obi-category-title">{category}</h3>
                </div>

                <ul className="obi-illegality-list">
                  {Object.keys(groupedByIllegality).map((illegality) => {
                    const legalities = groupedByIllegality[illegality].length;
                    const paginatedItems = MAX_ROWS_TABLE_ILLEGALITIES * this.state.indexPagination;

                    const pageSize = (legalities - paginatedItems) > MAX_ROWS_TABLE_ILLEGALITIES ?
                        MAX_ROWS_TABLE_ILLEGALITIES : (legalities - paginatedItems);

                    return (
                      <li key={category + illegality}>
                        <div className="l-container">
                          <div className="obi-illegality-list-item">
                            {/* Severity list */}
                            <ul className="obi-severity-list">
                              {groupedByIllegality[illegality].map(({ severity, id }) =>
                                <li key={id} className={`obi-severity-list-item -severity-${severity}`} />
                              )}
                            </ul>

                            {/* Illegality total */}
                            <div className="obi-illegality-total">{legalities}</div>

                            {/* Illegality title */}
                            <h4
                              className="c-title -default obi-illegality-title"
                              onClick={() =>
                                this.triggerSelectedIllegality({ category, illegality, year })
                              }
                            >
                              {illegality}
                            </h4>
                          </div>
                        </div>

                        {/* Category */}
                        {selected.category === category
                          && selected.illegality === illegality
                          && selected.year === year &&
                          <div className="obi-illegality-info">
                            <div className="l-container">
                              <h2 className="c-title obi-illegality-info-title">{illegality}</h2>

                              {groupedByIllegality[illegality].length > 0 &&
                                <Table
                                  sortable
                                  className="-light"
                                  data={groupedByIllegality[illegality]}
                                  options={{
                                    pagination: legalities > MAX_ROWS_TABLE_ILLEGALITIES,
                                    showPageSizeOptions: false,
                                    columns: [
                                      {
                                        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'date' })}</span>,
                                        accessor: 'date',
                                        headerClassName: '-a-left',
                                        className: '-a-left',
                                        minWidth: 75,
                                        Cell: (attr) => {
                                          const date = new Date(attr.value);
                                          const monthName = date ? date.toLocaleString('en-us', { month: 'short' }) : '-';
                                          const year = date ? date.getFullYear() : '-';
                                          return <span>{`${monthName} ${year}`}</span>;
                                        }
                                      },
                                      {
                                        Header: <span className="sortable">{this.props.intl.formatMessage({ id: 'severity' })}</span>,
                                        accessor: 'severity',
                                        headerClassName: '-a-center',
                                        className: '-a-left severity',
                                        minWidth: 150,
                                        Cell: attr => <span className={`severity-item -sev-${attr.value}`}>{attr.value}</span>
                                      },
                                      {
                                        Header: <span>{this.props.intl.formatMessage({ id: 'description' })}</span>,
                                        accessor: 'details',
                                        headerClassName: '-a-left',
                                        className: 'description',
                                        sortable: false,
                                        minWidth: 420,
                                        Cell: attr => <p>{attr.value}</p>
                                      },
                                      // not ready
                                      {
                                        Header: <span>{this.props.intl.formatMessage({ id: 'evidence' })}</span>,
                                        accessor: 'report',
                                        sortable: false,
                                        headerClassName: '-a-left',
                                        minWidth: 150,
                                        Cell: (attr) => {
                                          if (attr.value && attr.value.attachment && attr.value.attachment.url) {
                                            return (
                                              <a
                                                className="evidence-link"
                                                href={attr.value.attachment.url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={attr.value.title}
                                              >
                                                Document
                                              </a>
                                            );
                                          }

                                          return null;
                                        }
                                      }
                                    ],
                                    nextPageSize: pageSize,
                                    pageSize,
                                    onPageChange: (indexPage) => {
                                      this.setState({ indexPagination: indexPage });
                                    }
                                  }}
                                />}
                            </div>
                          </div>
                        }
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

TotalObservationsByOperatorByCategorybyIlegallity.propTypes = {
  data: PropTypes.array,
  year: PropTypes.number,
  intl: intlShape.isRequired
};

export default injectIntl(TotalObservationsByOperatorByCategorybyIlegallity);
