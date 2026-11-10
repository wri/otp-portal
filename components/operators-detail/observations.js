import React, { Fragment } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Utils
import { PALETTE_COLOR_1, PALETTE_COLOR_2 } from 'constants/charts';

// Intl
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { getOperatorObservations } from 'modules/operators-detail';

// Components
import Checkbox from 'components/form/Checkbox';
import Card from 'components/ui/card';
import Donut from 'components/ui/donut';

import { setUrlParam } from 'utils/url';
import { groupBy, transformValues } from 'utils/general';

const TotalObservationsByOperator = dynamic(() => import('components/operators-detail/observations/total'), { ssr: false });
const TotalObservationsByOperatorByCategorybyIllegality = dynamic(() => import('components/operators-detail/observations/by-category-illegality'), { ssr: false });

const severities = ['unknown', 'low', 'medium', 'high'];
// Binds the last word to the count, so a wrapped label never leaves "- 8" on a line of its own
const donutLabel = (name, value) => {
  const lastSpace = name.lastIndexOf(' ');
  return (
    <>
      {name.slice(0, lastSpace + 1)}
      <span className="whitespace-nowrap">{name.slice(lastSpace + 1)} - {value}</span>
    </>
  );
};

const OperatorsDetailObservations = (props) => {
  const intl = useIntl();
  const router = useRouter();

  const displayAll = router.query.display_all === 'true';

  const onChangeDisplayAll = ({ checked }) => {
    setUrlParam('display_all', checked ? null : true);
  };

  const observationData = props.operatorObservations.filter(
    (obs) => (displayAll || obs.hidden === false)
  ).map(obs => ({
    ...obs,
    level: obs.level || 0
  }));

  const formatSeverityLabel = ({ name, value }) => {
    const key = severities[parseInt(name, 10)] || 'unknown';
    const severityName = intl.formatMessage({ id: key });
    return donutLabel(severityName, value);
  }

  const bySeverity = transformValues(groupBy(observationData, "level"), (obs) => obs.length);
  const byCategory = transformValues(groupBy(observationData, "category"), (obs) => obs.length);

  const bySeverityChart = Object.keys(bySeverity).map(level => ({ name: level, value: bySeverity[level], fill: PALETTE_COLOR_1[level]?.fill }));
  const byCategoryChart = Object.keys(byCategory).map((cat, i) => ({ name: cat, value: byCategory[cat], fill: PALETTE_COLOR_2[i % PALETTE_COLOR_2.length].fill }));

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
                  checked: !displayAll,
                  title: intl.formatMessage({ id: 'operator-detail.observations.display_new', defaultMessage: 'Display only observations made by independent forest monitors in the past five years' }),
                }}
                onChange={onChangeDisplayAll}
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
                <Donut data={bySeverityChart} innerRatio={90 / 160} formatLabel={formatSeverityLabel} animate />
              </div>
              <div className="columns small-12 medium-6">
                <h3 className='c-title -extrabig -proximanova'><center>{intl.formatMessage({ id: 'by_category', defaultMessage: 'By category' })}</center></h3>
                <Donut data={byCategoryChart} innerRatio={90 / 160} formatLabel={({ name, value }) => donutLabel(name, value)} animate />
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
  getOperatorObservations: PropTypes.func
};

export default connect(
  (state) => ({
    language: state.language
  }),
  {
    getOperatorObservations
  }
)(OperatorsDetailObservations);
