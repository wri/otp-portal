import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

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
  const observations = operatorsDetail.data?.observations?.length || 0;
  const visits = operatorsDetail.data.observations ? HELPERS_OBS.getMonitorVisits(operatorObservations) : 0;
  const fmus = operatorsDetail.data?.fmus?.length || 0;

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
              operatorsDetail.data.observations
                ? HELPERS_OBS.getAvgObservationByMonitors(operatorObservations)
                : '-'
            }
            title={intl.formatMessage({
              id: 'operator-detail.overview.card2.title',
            })}
            description={intl.formatMessage(
              {
                id: observations > 0 ? 'operator-detail.overview.cardobs.description' : 'operator-detail.overview.cardobs.none',
                defaultMessage: observations > 0
                  ? '{observations, plural, one {There was {observations} observation} other {There were {observations} observations}} from {visits, plural, one {{visits} independent monitor visit} other {{visits} independent monitor visits}}.'
                  : 'There are no observations.'
              },
              {
                observations,
                visits
              }
            )}
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
            description={intl.formatMessage(
              {
                id: 'operator-detail.overview.cardfmu.description',
                defaultMessage: '{fmus, plural, =0 {{fmus} are managed by {company_name}.} one {{fmus} is managed by {company_name}. The map of this FMU is available in the FMUs section} other {{fmus} are managed by {company_name}. The map of these FMUs is available in the FMUs section.}}'
              },
              {
                fmus,
                company_name: operatorsDetail.data.name || '',
              }
            )}
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
  intl: intlShape.isRequired,
};

Gallery.defaultProptypes = {
  operatorObservations: [],
  operatorDocumentation: [],
};

export default injectIntl(Gallery);
