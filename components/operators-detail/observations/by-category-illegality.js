import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { HELPERS } from 'utils/observations';

export default class TotalObservationsByOperatorByCategorybyIlegallity extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: {}
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
        selected: {}
      });
    } else {
      this.setState({
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
    const groupedByCategory = HELPERS.getGroupedByCategory(data, year);

    return (
      <div className="c-observations-by-illegality">
        {/* Charts */}
        <ul className="obi-category-list">
          {Object.keys(groupedByCategory).map((category) => {
            const groupedByIllegality = HELPERS.getGroupedByIllegality(groupedByCategory[category]);

            return (
              <li key={category} className="obi-category-list-item">
                <div className="l-container">
                  <h3 className="c-title -default -proximanova -uppercase obi-category-title">{category}</h3>
                </div>

                <ul className="obi-illegality-list">
                  {Object.keys(groupedByIllegality).map((illegality) => {
                    const total = groupedByIllegality[illegality].length;

                    return (
                      <li key={category + illegality}>
                        <div className="l-container">
                          <div className="obi-illegality-list-item">
                            {/* Severity list */}
                            <ul className="obi-severity-list">
                              {groupedByIllegality[illegality].map(({ severity }, i) => {
                                return (
                                  <li key={category + illegality + severity + i} className={`obi-severity-list-item -severity-${severity}`} />
                                );
                              })}
                            </ul>

                            {/* Illegality total */}
                            <div className="obi-illegality-total">{total}</div>

                            {/* Illegality title */}
                            <h4
                              className="c-title -default obi-illegality-title"
                              onClick={() => this.triggerSelectedIllegality({ category, illegality, year })}
                            >
                              {illegality}
                            </h4>
                          </div>
                        </div>

                        {/* Category */}
                        {selected.category === category && selected.illegality === illegality && selected.year === year &&
                          <div className="obi-illegality-info">
                            <div className="l-container">
                              <h2 className="c-title obi-illegality-info-title">{illegality}</h2>

                              {/* Render table with other theme */}
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
  year: PropTypes.number
};
