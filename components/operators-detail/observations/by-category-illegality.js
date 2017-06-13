import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import flatten from 'lodash/flatten';

// Constants
import { PALETTE_COLOR_1, ANIMATION_TIMES } from 'constants/rechart';

// Components
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts';


export default class TotalObservationsByOperatorByCategorybyIlegallity extends React.Component {

  /**
   * HELPERS
   * - getGroupedByYear
   * - getGroupedByCategory
   * - getGroupedByIllegality
  */
  getGroupedByYear(data) {
    return groupBy(data || this.props.data, 'year');
  }

  getGroupedByCategory(data) {
    const { year } = this.props;
    if (year) {
      const groupedByYear = this.getGroupedByYear();
      return groupBy(groupedByYear[year], 'category');
    }
    return groupBy(data || this.props.data, 'category');
  }

  getGroupedByIllegality(data) {
    return groupBy(data || this.props.data, 'illegality');
  }

  render() {
    const groupedByCategory = this.getGroupedByCategory();

    return (
      <div className="c-observations-by-illegality">
        {/* Charts */}
        <ul className="obi-category-list">
          {Object.keys(groupedByCategory).map((category) => {
            const groupedByIllegality = this.getGroupedByIllegality(groupedByCategory[category]);

            return (
              <li key={category} className="obi-category-list-item">
                <h3 className="c-title -default -proximanova -uppercase obi-category-title">{category}</h3>

                <ul className="obi-illegality-list">
                  {Object.keys(groupedByIllegality).map((illegality) => {
                    const total = groupedByIllegality[illegality].length;

                    return (
                      <li key={illegality} className="obi-illegality-list-item">
                        <ul className="obi-severity-list">
                          {groupedByIllegality[illegality].map(({ severity }) => {
                            return (
                              <li className={`obi-severity-list-item -severity-${severity}`} />
                            );
                          })}
                        </ul>
                        <div className="obi-illegality-total">{total}</div>
                        <h4 className="c-title -default obi-illegality-title">{illegality}</h4>
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
  year: PropTypes.number
};
