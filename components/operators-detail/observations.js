import React, { Fragment, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PieChart, Pie, Bar, XAxis, BarChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';

// Utils
import { LEGEND_SEVERITY, PALETTE_COLOR_1, PALETTE_COLOR_2, PALETTE_COLOR_3 } from 'constants/rechart';

// Intl
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { getOperatorDocumentationFMU } from 'selectors/operators-detail/documentation';

import { getOperatorObservations } from 'modules/operators-detail';

// Components
import DocumentsFilter from 'components/operators-detail/documentation/documents-filter';
import Checkbox from 'components/form/Checkbox';
import Card from 'components/ui/card';

import { setUrlParam } from 'utils/url';
import { groupBy, transformValues } from 'utils/general';

const TotalObservationsByOperator = dynamic(() => import('components/operators-detail/observations/total'));
const TotalObservationsByOperatorByCategorybyIllegality = dynamic(() => import('components/operators-detail/observations/by-category-illegality'));

const severities = ['unknown', 'low', 'medium', 'high'];

const SimpleTooltip = ({ active, payload }) => {
  const intl = useIntl();
  const isVisible = active && payload && payload.length;
  const name = isVisible ? payload[0].name : null;
  return (
    <div className='c-tooltip -white auto-width'>
      {isVisible && (
        <div>
          <strong>{name}</strong>
        </div>
      )}
    </div>
  );
}

const StatusTooltip = ({ active, payload }) => {
  const intl = useIntl();

  const isVisible = active && payload && payload.length;
  const status = isVisible ? payload[0].name : null;
  const statusName = intl.formatMessage({ id: `observations.status-${status}` });

  return (
    <div className='c-tooltip -white auto-width'>
      {isVisible && (
        <div>
          <strong>{statusName}</strong>
        </div>
      )}
    </div>
  );
}

const SeveritiesTooltip = ({ active, payload }) => {
  const intl = useIntl();
  const isVisible = active && payload && payload.length;
  const severityLevel = isVisible ? payload[0].name : null;
  const key = severities[parseInt(severityLevel, 10)] || 'unknown';
  const severityName = intl.formatMessage({ id: key });
  return (
    <div className='c-tooltip -white auto-width'>
      {isVisible && (
        <div>
          <strong>{severityName}</strong>
        </div>
      )}
    </div>
  );
}

const OperatorsDetailObservations = (props) => {
  const intl = useIntl();
  const router = useRouter();
  const operator = props.operatorsDetail.data;

  const [displayHidden, setDisplayHidden] = useState(true);

  useEffect(() => {
    setDisplayHidden(router.query.display_hidden === 'true');
  }, [router.query.display_hidden]);

  const onChangeDisplayHidden = ({ checked }) => {
    setUrlParam('display_hidden', checked ? null : true);
  };

  const observationData = props.operatorObservations.filter(
    (obs) => (
      (!props.FMU || (obs.fmu && obs.fmu.id === props.FMU.id)) &&
      (displayHidden || obs.hidden === false)
    )
  );

  const byYear = transformValues(groupBy(observationData, "date"), (obs) => obs.length);
  const bySeverity = transformValues(groupBy(observationData, "level"), (obs) => obs.length);
  const byCategory = transformValues(groupBy(observationData, "category"), (obs) => obs.length);
  const byStatus = transformValues(groupBy(observationData, "status"), (obs) => obs.length);

  const byYearChart = Object.keys(byYear).map(year => ({ name: year, value: byYear[year] }));
  const bySeverityChart = Object.keys(bySeverity).map(level => ({ name: level, value: bySeverity[level], fill: PALETTE_COLOR_1[level]?.fill }));
  const byCategoryChart = Object.keys(byCategory).map(cat => ({ name: cat, value: byCategory[cat] }));
  const byStatusChart = Object.keys(byStatus).map(status => ({ name: status, value: byStatus[status] }));

  const description = `
    Third-party organizatibons, including independent forest monitors, conduct missions and research to identify and report on potential
    illegalities related to forest management, harvest and transport of timber. These reports on instances of suspected
    noncompliance by companies and/or by government actors are referred to as &apos;observations&apos;.
  `

  return (
    <div className="c-section">
      <div className="l-container">
        <Card
          theme="-primary"
          title="Observations from independent forest monitors"
          description={description}
          Component={
            <div>
              <Checkbox
                properties={{
                  checked: !displayHidden,
                  title: `display only observations made by independent forest monitors linked to ${operator.name} in the past five years`,
                }}
                onChange={onChangeDisplayHidden}
              />
            </div>
          }
        />
      </div>

      {!!observationData.length && (
        <Fragment>
          <article className="c-article">
            <div className="l-container">
              <div className="content">
                <TotalObservationsByOperator data={observationData} />
              </div>
            </div>
          </article>

          <div className="l-container">
            <div className="row l-row">
              <div className="columns small-12 medium-6">
                <h3 className='c-title -extrabig -proximanova'><center>By year</center></h3>
                <ResponsiveContainer height={400}>
                  <BarChart data={byYearChart}>
                    <XAxis dataKey="name" />
                    <Bar dataKey="value" fill={PALETTE_COLOR_2[2].fill} label={{ fill: 'white', fontSize: 22 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="columns small-12 medium-6">
                <h3 className='c-title -extrabig -proximanova'><center>By severity</center></h3>
                <ResponsiveContainer height={400}>
                  <PieChart>
                    <Pie
                      data={bySeverityChart}
                      dataKey="value"
                      outerRadius={160}
                      innerRadius={160 - 40}
                      startAngle={90}
                      endAngle={-270}
                      label={{ fontSize: 22 }}
                      labelLine={false}
                    >
                      {bySeverityChart.map((entry, index) => (
                        <Cell key={entry.value} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={SeveritiesTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="columns small-12 medium-6">
                <h3 className='c-title -extrabig -proximanova'><center>By category</center></h3>
                <ResponsiveContainer height={400}>
                  <PieChart>
                    <Pie
                      data={byCategoryChart}
                      dataKey="value"
                      outerRadius={160}
                      innerRadius={160 - 40}
                      startAngle={90}
                      endAngle={-270}
                      label={{ fontSize: 22 }}
                      labelLine={false}
                    >
                      {byCategoryChart.map((entry, index) => (
                        <Cell key={entry.value} fill={PALETTE_COLOR_2[index].fill} />
                      ))}
                    </Pie>
                    <Tooltip content={SimpleTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="columns small-12 medium-6">
                <h3 className='c-title -extrabig -proximanova'><center>By status</center></h3>
                <ResponsiveContainer height={400}>
                  <PieChart>
                    <Pie
                      data={byStatusChart}
                      dataKey="value"
                      outerRadius={160}
                      innerRadius={160 - 40}
                      startAngle={90}
                      endAngle={-270}
                      label={{ fontSize: 22 }}
                      labelLine={false}
                    >
                      {byStatusChart.map((entry, index) => (
                        <Cell key={entry.value} fill={PALETTE_COLOR_3[index].fill} />
                      ))}
                    </Pie>
                    <Tooltip content={StatusTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <article className="c-article">
            <div className="l-container">
              <header>
                <h2 className="c-title -large">
                  Observations grouped by illegality category
                </h2>
              </header>
            </div>

            <br />
            <br />

            <TotalObservationsByOperatorByCategorybyIllegality
              data={observationData}
            />
          </article>
        </Fragment>
      )}

      {!observationData.length && (
        <div className="l-container">
          <div className="c-no-data -top-margin">
            {intl.formatMessage({ id: 'no-observations' })}
          </div>
        </div>
      )}
    </div>
  );
}

OperatorsDetailObservations.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorObservations: PropTypes.array,
  FMU: PropTypes.shape({ id: PropTypes.string }),
  getOperatorObservations: PropTypes.func
};

export default connect(
  (state) => ({
    FMU: getOperatorDocumentationFMU(state),
  }),
  {
    getOperatorObservations
  }
)(OperatorsDetailObservations);
