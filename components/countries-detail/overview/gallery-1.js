import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_OBS } from 'utils/observations';
import { HELPERS_DOC } from 'utils/documentation';

// Components
import Card from 'components/ui/card';

class Gallery1 extends React.Component {
  static propTypes = {
    url: PropTypes.object.isRequired,
    countriesDetail: PropTypes.object.isRequired,
    countryObservations: PropTypes.array,
    countryDocumentation: PropTypes.array,
    intl: intlShape.isRequired
  };

  static defaultProptypes = {
    countryObservations: [],
    countryDocumentation: []
  };

  render() {
    const { url, countriesDetail, countryObservations, countryDocumentation, intl } = this.props;

    const observations = countryObservations?.length || 0;
    const visits = countryObservations ? HELPERS_OBS.getMonitorVisits(countryObservations) : 0;

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
          <div
            className="columns small-12 medium-6"
          >
            <Card
              theme="-primary"
              letter={(countryDocumentation) ? `${HELPERS_DOC.getPercentage(countriesDetail.data)}%` : '-'}
              title={this.props.intl.formatMessage({ id: 'country-detail.overview.card1.title' })}
              description={this.props.intl.formatMessage(
                { id: 'country-detail.overview.card1.description' },
                {
                  percentage: (countryDocumentation) ? HELPERS_DOC.getPercentage(countriesDetail.data) : '-'
                }
              )}
              link={{
                label: this.props.intl.formatMessage({ id: 'country-detail.overview.card1.link.label' }),
                href: `/country-detail?tab=documentation&id=${url.query.id}`,
                as: `/countries/${url.query.id}/documentation`
              }}
            />
          </div>

          <div
            className="columns small-12 medium-6"
          >
            <Card
              theme="-primary"
              letter={(countryObservations) ? HELPERS_OBS.getAvgObservationByMonitors(countryObservations) : '-'}
              title={this.props.intl.formatMessage({ id: 'country-detail.overview.card2.title' })}
              description={obsDescription}
              link={{
                label: this.props.intl.formatMessage({ id: 'country-detail.overview.card2.link.label' }),
                href: `/country-detail?tab=observations&id=${url.query.id}`,
                as: `/countries/${url.query.id}/observations`
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(Gallery1);
