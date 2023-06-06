import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Utils
import { HELPERS_OBS } from 'utils/observations';
import { HELPERS_DOC } from 'utils/documentation';

// Components
import Card from 'components/ui/card';

function Gallery({
  url,
  operatorsDetail,
  operatorObservations,
  operatorDocumentation,
  intl,
}) {
  const observations = operatorObservations.length || 0;
  const visits = HELPERS_OBS.getMonitorVisits(operatorObservations) || 0;
  const fmus = operatorsDetail.data?.fmus?.length || 0;

  let fmuDescription;
  // French language does not work well with standard plural CLDR rules ¯\_(ツ)_/¯
  if (fmus > 0) {
    fmuDescription = [
      intl.formatMessage({
        id: 'operator-detail.overview.cardfmu.description',
        defaultMessage: '{fmus, plural, one {{fmus} is managed by {company_name}.} other {{fmus} are managed by {company_name}.}}'
      }, { fmus, company_name: operatorsDetail.data.name || '' }),
      intl.formatMessage({
        id: 'operator-detail.overview.cardfmu.description_2',
        defaultMessage: '{fmus, plural, one {The map of this FMU is available in the FMUs section} other {The map of these FMUs is available in the FMUs section.}}',
      }, {fmus})
    ].join(' ')
  } else {
    fmuDescription = intl.formatMessage({
      id: 'operator-detail.overview.cardfmu.none',
      defaultMessage: 'There are no FMUs managed by {company_name}.'
    }, { company_name: operatorsDetail.data.name || '' });
  }
  let obsDescription;
  if (observations > 0) {
    obsDescription = [
      intl.formatMessage({
        id: 'operator-detail.overview.cardobs.description',
        defaultMessage: '{observations, plural, one {There was {observations} observation} other {There were {observations} observations}}'
      }, {observations}),
      intl.formatMessage({
        id: 'operator-detail.overview.cardobs.description_2',
        defaultMessage: 'from {visits, plural, one {{visits} independent monitor visit} other {{visits} independent monitor visits}}.'
      }, {visits})
    ].join(' ');
  } else {
    obsDescription = intl.formatMessage({
      id: 'operator-detail.overview.cardobs.none',
      defaultMessage: 'There are no observations.'
    });
  }

  return (
    <div className="c-gallery">
      <div className="row l-row">
        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            letter={
              operatorDocumentation
                ? `${HELPERS_DOC.getPercentage(operatorsDetail.data)}%`
                : '-'
            }
            title={intl.formatMessage({
              id: 'operator-detail.overview.card1.title',
            })}
            description={intl.formatMessage(
              { id: 'operator-detail.overview.card1.description' },
              {
                percentage: operatorDocumentation
                  ? HELPERS_DOC.getPercentage(operatorsDetail.data)
                  : '-',
              }
            )}
            link={{
              label: intl.formatMessage({
                id: 'operator-detail.overview.card1.link.label',
              }),
              href: `/operators/detail?tab=documentation&id=${url.query.id}`,
              as: `/operators/${url.query.id}/documentation`,
            }}
          />
        </div>

        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            letter={
              HELPERS_OBS.getAvgObservationByMonitors(operatorObservations)
            }
            title={intl.formatMessage({
              id: 'operator-detail.overview.card2.title',
            })}
            description={obsDescription}
            link={{
              label: intl.formatMessage({
                id: 'operator-detail.overview.card2.link.label',
              }),
              href: `/operators/detail?tab=observations&id=${url.query.id}`,
              as: `/operators/${url.query.id}/observations`,
            }}
          />
        </div>

        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            letter={operatorsDetail.data.fmus ? operatorsDetail.data.fmus.length : '-'}
            title={intl.formatMessage(
              {
                id: 'operator-detail.overview.cardfmu.title',
                defaultMessage: '{fmus, plural, one {Forest management unit} other {Forest management units}}'
              },
              { fmus }
            )}
            description={fmuDescription}
            link={{
              label: intl.formatMessage({
                id: 'operator-detail.overview.card3.link.label',
              }),
              href: `/operators/detail?tab=fmus&id=${url.query.id}`,
              as: `/operators/${url.query.id}/fmus`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

Gallery.propTypes = {
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object.isRequired,
  operatorObservations: PropTypes.array,
  operatorDocumentation: PropTypes.array,
  intl: PropTypes.object.isRequired,
};

Gallery.defaultProptypes = {
  operatorObservations: [],
  operatorDocumentation: [],
};

export default injectIntl(Gallery);
