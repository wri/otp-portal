import React, { Fragment, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';

// Utils
import { PALETTE_COLOR_1, PALETTE_COLOR_2 } from 'constants/rechart';

// Intl
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { getOperatorDocumentationFMU, getHistoricFMUs } from 'selectors/operators-detail/documentation';

import { getOperatorObservations, setOperatorDocumentationFMU } from 'modules/operators-detail';

// Components
import Checkbox from 'components/form/Checkbox';
import Card from 'components/ui/card';

import { setUrlParam } from 'utils/url';
import { groupBy, transformValues } from 'utils/general';

import useDeviceInfo from 'hooks/use-device-info';

const TotalObservationsByOperator = dynamic(() => import('components/operators-detail/observations/total'));
const TotalObservationsByOperatorByCategorybyIllegality = dynamic(() => import('components/operators-detail/observations/by-category-illegality'));

const severities = ['unknown', 'low', 'medium', 'high'];

const OperatorsDetailObservations = (props) => {
  const intl = useIntl();
  const router = useRouter();
  const { fmus, setFMU } = props;

  const [displayHidden, setDisplayHidden] = useState(true);

  const { isDesktop } = useDeviceInfo();

  useEffect(() => {
    setDisplayHidden(router.query.display_hidden === 'true');
  }, [router.query.display_hidden]);

  const onChangeDisplayHidden = ({ checked }) => {
    setUrlParam('display_hidden', checked ? null : true);
  };

  useEffect(() => {
    setFMU(fmus.find(f => f.id === router.query.fmuId));
  }, [router.query.fmuId, fmus])
  const onFmuChange = (fmuId) => {
    setUrlParam('fmuId', fmuId);
  };

  const observationData = props.operatorObservations.filter(
    (obs) => (
      (!props.FMU || (obs.fmu && obs.fmu.id === props.FMU.id)) &&
      (displayHidden || obs.hidden === false)
    )
  ).map(obs => ({
    ...obs,
    level: obs.level || 0
  }));

  const CustomLabelCategory = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value, fill }) => {
    const RADIAN = Math.PI / 180;
    // Position labels outside the donut
    const padding = isDesktop ? 10 : 3;
    const radius = outerRadius + padding;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const width = isDesktop ? 180 : 100;
    const isRightSide = x > cx;
    const labelX = isRightSide ? x : x - width;

    return (
      <foreignObject x={labelX} y={y} width={width} height={100}>
        <div className='c-title -proximanova' style={{
          wordWrap: 'break-word',
          fontSize: '15px',
          fontWeight: '600',
          display: 'flex',
          justifyContent: isRightSide ? 'left' : 'right',
          color: fill
        }}>
          <div style={{ textAlign: 'left' }}>
            {name} - {value}
          </div>
        </div>
      </foreignObject>
    );
  };

  const CustomLabelSeverity = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value, fill }) => {
    const RADIAN = Math.PI / 180;
    // Position labels outside the donut
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const isRightSide = x > cx;
    const labelX = isRightSide ? x - 60 : x - 90;

    const key = severities[parseInt(name, 10)] || 'unknown';
    const severityName = intl.formatMessage({ id: key });

    return (
      <foreignObject x={labelX} y={y} width={150} height={100}>
        <div className='c-title -proximanova' style={{
          wordWrap: 'break-word',
          fontSize: '15px',
          fontWeight: '600',
          textAlign: 'center',
          color: fill
        }}>
          {severityName} - {value}
        </div>
      </foreignObject>
    );
  };

  const bySeverity = transformValues(groupBy(observationData, "level"), (obs) => obs.length);
  const byCategory = transformValues(groupBy(observationData, "category"), (obs) => obs.length);

  const bySeverityChart = Object.keys(bySeverity).map(level => ({ name: level, value: bySeverity[level], fill: PALETTE_COLOR_1[level]?.fill }));
  const byCategoryChart = Object.keys(byCategory).map(cat => ({ name: cat, value: byCategory[cat] }));

  return (
    <div className="c-section c-operators-detail-observations">
      <div className="l-container">
        <Card
          theme="-primary"
          title={intl.formatMessage({ id: 'operator-detail.observations.title', defaultMessage: 'Observations from independent forest monitors' })}
          description={intl.formatMessage({ id: 'operator-detail.observations.description' })}
          Component={
            <div>
              <Checkbox
                properties={{
                  checked: !displayHidden,
                  title: intl.formatMessage({ id: 'operator-detail.observations.display_new', defaultMessage: 'Display only observations made by independent forest monitors in the past five years' }),
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

          <div className="l-container c-operators-details-observations__charts">
            <div className="row l-row">
              <div className="columns small-12 medium-6">
                <h3 className='c-title -extrabig -proximanova'><center>{intl.formatMessage({ id: 'by_severity', defaultMessage: 'By severity' })}</center></h3>
                <ResponsiveContainer height={400} style={{ padding: isDesktop ? 0 : '20px' }}>
                  <PieChart>
                    <Pie
                      data={bySeverityChart}
                      dataKey="value"
                      outerRadius={160}
                      innerRadius={160 - 70}
                      startAngle={90}
                      endAngle={-270}
                      label={CustomLabelSeverity}
                      labelLine={false}
                    >
                      {bySeverityChart.map((entry, index) => (
                        <Cell key={entry.value} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="columns small-12 medium-6">
                <h3 className='c-title -extrabig -proximanova'><center>{intl.formatMessage({ id: 'by_category', defaultMessage: 'By category' })}</center></h3>
                <ResponsiveContainer height={400} style={{ padding: isDesktop ? 0 : '20px' }}>
                  <PieChart>
                    <Pie
                      data={byCategoryChart}
                      dataKey="value"
                      outerRadius={160}
                      innerRadius={160 - 70}
                      startAngle={90}
                      endAngle={-270}
                      label={CustomLabelCategory}
                      labelLine={false}
                    >
                      {byCategoryChart.map((entry, index) => (
                        <Cell key={entry.value} fill={PALETTE_COLOR_2[index].fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <article className="c-article">
            <div className="l-container">
              <header>
                <h2 className="c-title -large">
                  {intl.formatMessage({ id: 'observations_by_illegality', defaultMessage: 'Observations by illegality' })}
                </h2>
              </header>
            </div>

            <br />
            <br />

            <TotalObservationsByOperatorByCategorybyIllegality
              data={observationData}
              language={props.language}
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
  language: PropTypes.string,
  operatorObservations: PropTypes.array,
  fmus: PropTypes.array,
  FMU: PropTypes.shape({ id: PropTypes.string }),
  setFMU: PropTypes.func,
  getOperatorObservations: PropTypes.func
};

export default connect(
  (state) => ({
    language: state.language,
    fmus: getHistoricFMUs(state),
    FMU: getOperatorDocumentationFMU(state),
  }),
  {
    getOperatorObservations,
    setFMU: setOperatorDocumentationFMU
  }
)(OperatorsDetailObservations);
