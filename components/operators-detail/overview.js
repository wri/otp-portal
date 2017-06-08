/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';

// Next components
import Link from 'next/link';

// Constants
import { PALETTE_COLOR_1, ANIMATION_TIMES, LEGEND_SEVERITY } from 'constants/rechart';

// Components
import { BarChart, Bar, ResponsiveContainer } from 'recharts';
import Gallery1 from 'components/operators-detail/overview/gallery-1';
import ChartLegend from 'components/ui/chart-legend';

// Example of how data should be
const data = {
  'Right to exploit': [{ name: 'Right to exploit', high: 4000, medium: 2400, low: 2400, unknown: 2040 }],
  'Timber harvesting': [{ name: 'Timber harvesting', high: 3000, medium: 1398, low: 2210, unknown: 2021 }],
  'Timber processing': [{ name: 'Timber processing', high: 2000, medium: 9800, low: 2290, unknown: 2029 }],
  'Social aspects': [{ name: 'Social aspects', high: 2780, medium: 3908, low: 2000, unknown: 2000 }],
  Payments: [{ name: 'Payments', high: 1890, medium: 4800, low: 2181, unknown: 2018 }],
  'Transport and export': [{ name: 'Page F', high: 2390, medium: 3800, low: 2500, unknown: 2050 }]
};

export default function OperatorsDetailOverview(props) {
  const { url } = props;
  const id = url.query.id;

  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        <Gallery1 />
        <article className="c-article">
          <div className="row custom-row">
            <div className="columns small-12 medium-8">
              <header>
                <h2 className="c-title">Overview</h2>
              </header>
              <div className="content">
                <div className="description">
                  <p>REM is a non-profit organisation that operates as Independent Monitor of Law Enforcement and Governance. Our mission is to stimulate government reform and action in natural resource extraction through independent monitoring and credible reporting of illegalities and related governance problems. We use this information to develop, with the concerned actors, constructive and viable solutions and assist in their implementation.</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* CHARTS */}
        {/* TODO: move it to a component as long as we need to re-use it in other places */}
        <article className="c-article">
          <div className="c-chart-container">
            {/* Header */}
            <header>
              <h2 className="c-title">Observations by category</h2>
            </header>

            {/* Legend */}
            <ChartLegend
              title={LEGEND_SEVERITY.title}
              list={LEGEND_SEVERITY.list}
              className="-horizontal"
            />

            {/* Charts */}
            <div className="row custom-row">
              {Object.keys(data).map(category => (
                <div key={category} className="columns small-6 medium-4 large-2">
                  <div className="c-chart">
                    <div className="chart -max-width-100">
                      <ResponsiveContainer height={120}>
                        <BarChart
                          data={data[category]}
                          barGap={5}
                          barCategoryGap={0}
                          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                          {...ANIMATION_TIMES}
                        >
                          <Bar dataKey="high" fill={PALETTE_COLOR_1[0].fill} />
                          <Bar dataKey="medium" fill={PALETTE_COLOR_1[1].fill} />
                          <Bar dataKey="low" fill={PALETTE_COLOR_1[2].fill} />
                          <Bar dataKey="unknown" fill={PALETTE_COLOR_1[3].fill} />

                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <h3 className="c-title -bigger">{category}</h3>

                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer>
              <Link
                href={{
                  pathname: url.pathname,
                  query: { id, tab: 'observations' }
                }}
                as={`/operators/${id}/observations`}
              >
                <a className="c-button -primary">Go to observations</a>
              </Link>
            </footer>
          </div>
        </article>
      </div>
    </div>
  );
}

OperatorsDetailOverview.propTypes = {
  url: PropTypes.object.isRequired
};
