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
    operatorsDetail: PropTypes.object.isRequired,
    operatorObservations: PropTypes.array,
    operatorDocumentation: PropTypes.array,
    intl: intlShape.isRequired
  };

  static defaultProptypes = {
    operatorObservations: [],
    operatorDocumentation: []
  };

  render() {
    const { url, operatorsDetail, operatorObservations, operatorDocumentation } = this.props;

    return (
      <div className="c-gallery">
        <div className="row l-row">
          <div
            className="columns small-12 medium-4"
          >
            <Card
              theme="-primary"
              letter={(operatorDocumentation) ? `${HELPERS_DOC.getPercentage(operatorsDetail.data)}%` : '-'}
              title={this.props.intl.formatMessage({ id: 'operator-detail.overview.card1.title' })}
              description={this.props.intl.formatMessage(
                { id: 'operator-detail.overview.card1.description' },
                {
                  percentage: (operatorDocumentation) ? HELPERS_DOC.getPercentage(operatorsDetail.data) : '-'
                }
              )}
              link={{
                label: this.props.intl.formatMessage({ id: 'operator-detail.overview.card1.link.label' }),
                href: `/operators-detail?tab=documentation&id=${url.query.id}`,
                as: `/operators/${url.query.id}/documentation`
              }}
            />
          </div>

          <div
            className="columns small-12 medium-4"
          >
            <Card
              theme="-primary"
              letter={(operatorsDetail.data.observations) ? HELPERS_OBS.getAvgObservationByMonitors(operatorObservations) : '-'}
              title={this.props.intl.formatMessage({ id: 'operator-detail.overview.card2.title' })}
              description={this.props.intl.formatMessage(
                { id: 'operator-detail.overview.card2.description' },
                {
                  observations: (operatorsDetail.data.observations) ? operatorsDetail.data.observations.length : '-',
                  visits: (operatorsDetail.data.observations) ? HELPERS_OBS.getMonitorVisits(operatorObservations) : '-'
                }
              )}
              link={{
                label: this.props.intl.formatMessage({ id: 'operator-detail.overview.card2.link.label' }),
                href: `/operators-detail?tab=observations&id=${url.query.id}`,
                as: `/operators/${url.query.id}/observations`
              }}
            />
          </div>

          <div
            className="columns small-12 medium-4"
          >
            <Card
              theme="-primary"
              letter={(operatorsDetail.data.fmus) ? operatorsDetail.data.fmus.length : '-'}
              title={this.props.intl.formatMessage({ id: 'operator-detail.overview.card3.title' })}
              description={this.props.intl.formatMessage(
                { id: 'operator-detail.overview.card3.description' },
                {
                  fmus: (operatorsDetail.data.fmus) ? operatorsDetail.data.fmus.length : '-',
                  company_name: operatorsDetail.data.name || ''
                }
              )}
              link={{
                label: this.props.intl.formatMessage({ id: 'operator-detail.overview.card3.link.label' }),
                href: `/operators-detail?tab=fmus&id=${url.query.id}`,
                as: `/operators/${url.query.id}/fmus`
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default injectIntl(Gallery1);
