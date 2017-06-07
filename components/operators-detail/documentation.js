import React from 'react';
import groupBy from 'lodash/groupBy';

// Constants
import { TABS_DOCUMENTATION_OPERATORS_DETAIL, DOCUMENTATION_OPERATORS_DETAIL } from 'constants/operators-detail';
import { PALETTE_COLOR_2, ANIMATION_TIMES, LEGEND_DOCUMENTATION } from 'constants/rechart';

// Components
import { PieChart, Pie, ResponsiveContainer, Cell, Legend } from 'recharts';
import StaticTabs from 'components/ui/static-tabs';
import DocCard from 'components/ui/doc-card';
import ChartLegend from 'components/ui/chart-legend';

const exampleData = [
  { name: 'Not provided', value: 4, fill: PALETTE_COLOR_2[0].fill, stroke: PALETTE_COLOR_2[0].stroke },
  { name: 'Provided (not valid)', value: 5, fill: PALETTE_COLOR_2[1].fill, stroke: PALETTE_COLOR_2[1].stroke },
  { name: 'Provided (valid)', value: 2, fill: PALETTE_COLOR_2[2].fill, stroke: PALETTE_COLOR_2[2].stroke }
];

export default class OperatorsDetailDocumentation extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tab: 'documents-list'
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  render() {
    // TODO: replace to a reseselect from the documentation asociated to an operator
    const documentsGroups = groupBy(DOCUMENTATION_OPERATORS_DETAIL, 'category');

    return (
      <div>
        <div className="c-section">
          <div className="l-container">
            <article className="c-article">
              <header>
                <h2 className="c-title">65% documents provided</h2>
              </header>

              <div className="row custom-row">
                <div className="columns small-6">
                  <div className="c-chart">
                    <ResponsiveContainer height={350}>
                      <PieChart>
                        <Pie
                          data={exampleData}
                          dataKey="value"
                          outerRadius={170}
                          innerRadius={162}
                          startAngle={90}
                          endAngle={-270}
                          {...ANIMATION_TIMES}
                        >
                          {exampleData.map(entry =>
                            <Cell key={entry.name} fill={entry.fill} stroke={entry.stroke} />
                          )}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <ChartLegend
                      list={LEGEND_DOCUMENTATION.list}
                      className="-absolute"
                    />
                  </div>
                </div>

                <div className="columns small-6">
                </div>
              </div>
            </article>
          </div>
        </div>

        <StaticTabs
          options={TABS_DOCUMENTATION_OPERATORS_DETAIL}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        <div className="c-section">
          <div className="l-container">
            {this.state.tab === 'documents-list' &&
              <ul className="c-doc-gallery">
                {Object.keys(documentsGroups).map(category => (
                  <li
                    key={category}
                    className="doc-gallery-item"
                  >
                    <header>
                      <h3 className="c-title -proximanova -extrabig -uppercase">{category}</h3>
                    </header>

                    <div className="row custom-row">
                      {documentsGroups[category].map(card => (
                        <div
                          key={card.id}
                          className="columns small-12 medium-4"
                        >
                          <DocCard
                            {...card}
                          />
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            }

            {this.state.tab === 'chronological-view' &&
              <h2 className="c-title">Chronological view</h2>
            }

          </div>
        </div>
      </div>
    );
  }
}

OperatorsDetailDocumentation.propTypes = {
};
