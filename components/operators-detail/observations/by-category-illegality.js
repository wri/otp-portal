import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl } from 'react-intl';

// Utils
import { HELPERS_OBS } from 'utils/observations';
import { PALETTE_COLOR_1 } from 'constants/rechart';

// components
import Table from 'components/ui/table';
import Icon from 'components/ui/icon';
import CheckboxGroup from 'components/form/CheckboxGroup';

import {
  tableCheckboxes,
  getColumnHeaders,
} from 'constants/observations-column-headers';

const MAX_ROWS_TABLE_ILLEGALITIES = 10;

const TotalObservationsByOperatorByCategorybyIlegallity = ({ data, year, intl }) => {
  const [selected, setSelected] = useState({});
  const [indexPagination, setIndexPagination] = useState(0);
  const [columns, setColumns] = useState([
    'status',
    'date',
    'country',
    'operator',
    'category',
    'observation',
    'level',
    'fmu',
    'report',
  ]);

  const triggerSelectedIllegality = ({ category, illegality, year }) => {
    // Toggle selected
    if (
      selected.category === category &&
      selected.illegality === illegality &&
      selected.year === year
    ) {
      resetSelected();
    } else {
      setIndexPagination(0);
      setSelected({
        category,
        illegality,
        year,
      });
    }
  };

  const resetSelected = () => {
    setIndexPagination(0);
    setSelected({});
  };

  const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data, year);

  const changeOfLabelLookup = {
    level: 'severity',
    observation: 'detail',
  };

  const columnHeaders = getColumnHeaders(intl);
  const inputs = tableCheckboxes;

  const tableOptions = inputs.map((column) => ({
    label: Object.keys(changeOfLabelLookup).includes(column)
      ? intl.formatMessage({ id: changeOfLabelLookup[column] })
      : intl.formatMessage({ id: column }),
    value: column,
  }));

  return (
    <div className="c-observations-by-illegality">
      {/* Charts */}
      <ul className="obi-category-list">
        {Object.keys(groupedByCategory).map((category) => {
          const groupedByIllegality = HELPERS_OBS.getGroupedByIllegality(
            groupedByCategory[category]
          );

          return (
            <li key={category} className="obi-category-list-item">
              <div className="l-container">
                <h3 className="c-title -default -proximanova -uppercase obi-category-title">
                  {category}
                </h3>
              </div>

              <ul className="obi-illegality-list">
                {Object.keys(groupedByIllegality).map((illegality) => {
                  const legalities = groupedByIllegality[illegality].length;
                  const paginatedItems =
                    MAX_ROWS_TABLE_ILLEGALITIES * indexPagination;

                  const pageSize =
                    legalities - paginatedItems > MAX_ROWS_TABLE_ILLEGALITIES
                      ? MAX_ROWS_TABLE_ILLEGALITIES
                      : legalities - paginatedItems;

                  const isSelected =
                    selected.category === category &&
                    selected.illegality === illegality &&
                    selected.year === year;

                  const listItemClassNames = classnames({
                    '-selected': isSelected,
                  });

                  return (
                    <li key={category + illegality}>
                      <div className="l-container">
                        <div
                          className={`obi-illegality-list-item ${listItemClassNames}`}
                        >
                          {/* Severity list */}
                          <ul className="obi-severity-list">
                            {groupedByIllegality[illegality].map(
                              ({ level, id }) => {
                                if (level === 'null' || level === null)
                                  return null;

                                return (
                                  <li
                                    key={id}
                                    className={`obi-severity-list-item -severity-${level}`}
                                    style={{
                                      background: PALETTE_COLOR_1[level].fill,
                                    }}
                                  />
                                );
                              }
                            )}
                          </ul>

                          {/* Illegality total */}
                          <div
                            className={`obi-illegality-total ${listItemClassNames}`}
                          >
                            {legalities}
                          </div>

                          {/* Illegality title */}
                          <h4
                            className="c-title -default obi-illegality-title"
                            onClick={() =>
                              triggerSelectedIllegality({
                                category,
                                illegality,
                                year,
                              })
                            }
                          >
                            {illegality}
                          </h4>
                        </div>
                      </div>

                      {/* Category */}
                      {isSelected && (
                        <div className="obi-illegality-info">
                          <div className="l-container">
                            <button
                              className="obi-illegality-info-close"
                              onClick={resetSelected}
                            >
                              <Icon name="icon-cross" className="-big" />
                            </button>
                            <h2 className="c-title obi-illegality-info-title">
                              {illegality}
                            </h2>
                            {groupedByIllegality[illegality].length > 0 && (
                              <Fragment>
                                <CheckboxGroup
                                  className="-inline -light"
                                  name="observations-columns"
                                  onChange={(value) => setColumns(value)}
                                  properties={{
                                    default: columns,
                                    name: 'observations-columns',
                                  }}
                                  options={tableOptions}
                                />
                                <br />
                                <Table
                                  sortable
                                  className="-light"
                                  data={groupedByIllegality[illegality]}
                                  options={{
                                    pagination:
                                      legalities >
                                      MAX_ROWS_TABLE_ILLEGALITIES,
                                    showPageSizeOptions: false,
                                    columns: columnHeaders.filter((header) =>
                                      columns.includes(
                                        header.accessor
                                      )
                                    ),
                                    nextPageSize: pageSize,
                                    pageSize,
                                    onPageChange: (indexPage) => {
                                      setIndexPagination(indexPage);
                                    },
                                  }}
                                />
                              </Fragment>
                            )}
                          </div>
                        </div>
                      )}
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
};

TotalObservationsByOperatorByCategorybyIlegallity.propTypes = {
  data: PropTypes.array,
  year: PropTypes.number,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TotalObservationsByOperatorByCategorybyIlegallity);
