import React, { Fragment, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Utils
import { HELPERS_OBS } from 'utils/observations';

// Intl
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';

import { getOperatorDocumentationFMU, getHistoricFMUs } from 'selectors/operators-detail/documentation';

import { getOperatorObservations, setOperatorDocumentationFMU } from 'modules/operators-detail';

// Components
import StaticTabs from 'components/ui/static-tabs';
import DocumentsFilter from 'components/operators-detail/documentation/documents-filter';
import Checkbox from 'components/form/Checkbox';

import { setUrlParam } from 'utils/url';

const TotalObservationsByOperator = dynamic(() => import('components/operators-detail/observations/total'));
const TotalObservationsByOperatorByCategory = dynamic(() => import('components/operators-detail/observations/by-category'));
const TotalObservationsByOperatorByCategorybyIllegality = dynamic(() => import('components/operators-detail/observations/by-category-illegality'));

const OperatorsDetailObservations = (props) => {
  const intl = useIntl();
  const router = useRouter();
  const { fmus, setFMU } = props;

  const [year, setYear] = useState(HELPERS_OBS.getMaxYear(props.operatorObservations));
  const [displayHidden, setDisplayHidden] = useState(false);

  useEffect(() => {
    setYear(HELPERS_OBS.getMaxYear(props.operatorObservations));
  }, [props.operatorObservations])

  useEffect(() => {
    if (props.FMU) {
      setYear(HELPERS_OBS.getMaxYear(props.operatorObservations.filter(
        (obs) => obs.fmu && obs.fmu.id === props.FMU.id
      )));
    }
  }, [props.FMU])

  useEffect(() => {
    setDisplayHidden(router.query.display_hidden === 'true');
  }, [router.query.display_hidden]);

  const onChangeDisplayHidden = ({ checked }) => {
    setUrlParam('display_hidden', checked ? true : null);
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
  );

  return (
    <div className="c-section">
      <div className="l-container">
        <DocumentsFilter showFMU onFmuChange={onFmuChange}>
          <span className="filter-option">
            <label>{intl.formatMessage({ id: 'filter.hidden', defaultMessage: 'Archived observations' })}</label>
            <div className="filters-dropdown">
              <Checkbox
                properties={{
                  checked: displayHidden,
                  title: intl.formatMessage({ id: 'filter.hidden.description', defaultMessage: 'Display observations that are more than five years old' }),
                }}
                onChange={onChangeDisplayHidden}
              />
            </div>
          </span>
        </DocumentsFilter>
      </div>

      {!!observationData.length && (
        <Fragment>
          <article className="c-article">
            <div className="l-container">
              <header>
                <h2 className="c-title">
                  {intl.formatMessage({
                    id: 'observations_from_independent_monitors',
                  })}
                </h2>
              </header>
              <div className="content">
                <TotalObservationsByOperator data={observationData} />
              </div>
            </div>
          </article>

          <article className="c-article">
            <div className="l-container">
              <header>
                <h2 className="c-title">
                  {intl.formatMessage({
                    id: 'observations_by_category',
                  })}
                </h2>
              </header>
            </div>

            <div className="content">
              <StaticTabs
                options={HELPERS_OBS.getYears(observationData)}
                defaultSelected={year.toString()}
                onChange={setYear}
              />

              <div className="l-container">
                <div className="content">
                  {/* CHARTS */}
                  <article className="c-article">
                    <TotalObservationsByOperatorByCategory
                      data={observationData}
                      year={parseInt(year, 10)}
                    />
                  </article>
                </div>
              </div>
            </div>
          </article>

          <article className="c-article">
            <TotalObservationsByOperatorByCategorybyIllegality
              data={observationData}
              year={parseInt(year, 10)}
            />
          </article>
        </Fragment>
      )}

      {!observationData.length && (
        <div className="l-container">
          <div className="c-no-data">
            {intl.formatMessage({ id: 'no-observations' })}
          </div>
        </div>
      )}
    </div>
  );
}

OperatorsDetailObservations.propTypes = {
  operatorObservations: PropTypes.array,
  fmus: PropTypes.array,
  FMU: PropTypes.shape({ id: PropTypes.string }),
  setFMU: PropTypes.func,
  getOperatorObservations: PropTypes.func
};

export default connect(
  (state) => ({
    fmus: getHistoricFMUs(state),
    FMU: getOperatorDocumentationFMU(state),
  }),
  {
    getOperatorObservations,
    setFMU: setOperatorDocumentationFMU
  }
)(OperatorsDetailObservations);
