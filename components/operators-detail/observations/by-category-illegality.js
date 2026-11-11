import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';
import classnames from 'classnames';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// components
import Icon from 'components/ui/icon';

// Table code (react-table, tooltips, modals) is only needed once a row is expanded.
// Appearing right after the click
// One loader for both: Turbopack gives an import() inlined in dynamic() its own chunk,
// so a separate preload import() would download the component twice
const loadTable = () => import('components/operators-detail/observations/illegality-table');
const IllegalityTable = dynamic(loadTable, { ssr: false });

const DEFAULT_COLUMNS = [
  'date',
  'observer-organizations',
  'observation',
  'level',
  'fmu',
  'report'
];

const TotalObservationsByOperatorByCategorybyIlegallity = ({ data, language }) => {
  const [expanded, setExpanded] = useState([]);
  // Shared by every expanded table
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);

  const toggleIllegality = (illegality) => {
    if (expanded.includes(illegality)) {
      setExpanded(expanded.filter(x => x !== illegality));
    } else {
      setExpanded([...expanded, illegality]);
    }
  };

  const groupedByCategory = HELPERS_OBS.getGroupedByCategory(data);

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
                            onMouseEnter={loadTable}
                            onClick={() => toggleIllegality(illegality)}>
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
                            <IllegalityTable
                              data={groupedByIllegality[illegality]}
                              columns={columns}
                              onChangeColumns={setColumns}
                              language={language}
                            />
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
  language: PropTypes.string,
  data: PropTypes.array
};

export default TotalObservationsByOperatorByCategorybyIlegallity;
