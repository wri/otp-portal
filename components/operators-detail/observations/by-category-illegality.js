import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { useIntl } from 'react-intl';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// components
import Accordion from 'components/ui/accordion';
import Table from 'components/ui/table';
import Icon from 'components/ui/icon';
import CheckboxGroup from 'components/form/CheckboxGroup';

import {
  tableCheckboxes,
  getColumnHeaders,
} from 'constants/observations-column-headers';

// const MAX_ROWS_TABLE_ILLEGALITIES = 10;

const TotalObservationsByOperatorByCategorybyIlegallity = ({ data }) => {
  const intl = useIntl();
  const [expanded, setExpanded] = useState([]);
  const [columns, setColumns] = useState([
    'date',
    'observer-organizations',
    'observation',
    'level',
    'fmu',
    'report'
  ]);

  const triggerSelectedIllegality = ({ category, illegality }) => {
    if (expanded.includes(illegality)) {
      setExpanded(expanded.filter(x => x !== illegality));
    } else {
      setExpanded([...expanded, illegality]);
    }
  };

  const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data);

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
                <h3 className="c-title -proximanova -uppercase -bold obi-category-title">
                  {category}
                </h3>
              </div>

              <ul className="obi-illegality-list">
                {Object.keys(groupedByIllegality).map((illegality) => {
                  const isSelected = expanded.includes(illegality);
                  const illegalityInfoClassName = classnames("obi-illegality-info", { '-expanded': isSelected });

                  return (
                    <li key={category + illegality}>
                      {/* Category */}
                      <div className={illegalityInfoClassName}>
                        <div className="l-container">
                          <h3 className="c-title -big -proximanova obi-illegality-info-title"
                            onClick={() =>
                              triggerSelectedIllegality({
                                category,
                                illegality
                              })
                            }>
                            <span>
                              {illegality}
                              {` (${groupedByIllegality[illegality].length})`}
                            </span>
                            {isSelected ? (
                              <Icon name="icon-arrow-up" />
                            ) : (
                              <Icon name="icon-arrow-down" />
                            )}
                          </h3>
                          {groupedByIllegality[illegality].length > 0 && isSelected && (
                            <Fragment>
                              <div>
                                <Accordion
                                  defaultOpen={false}
                                  header={
                                    <strong>Customize table content</strong>
                                  }
                                >
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
                                </Accordion>
                              </div>
                              <Table
                                sortable
                                className="-light"
                                data={groupedByIllegality[illegality]}
                                options={{
                                  showPagination: false,
                                  showPageSizeOptions: false,
                                  columns: columnHeaders.filter((header) =>
                                    columns.includes(
                                      header.accessor
                                    )
                                  )
                                }}
                              />
                            </Fragment>
                          )}
                        </div>
                      </div>
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
  data: PropTypes.array
};

export default TotalObservationsByOperatorByCategorybyIlegallity;
