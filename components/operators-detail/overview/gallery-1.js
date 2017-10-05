import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { HELPERS_OBS } from 'utils/observations';
import { HELPERS_DOC } from 'utils/documentation';
import { substitution } from 'utils/text';

// Components
import Card from 'components/ui/card';

const data = [{
  id: 'required-documents-uploaded',
  title: 'Required documents uploaded',
  description: 'These documents evidence compliance with the country\'s legal framework for forest management',
  letter: '{{DOCUMENTATION}}%',
  link: {
    label: 'Link',
    href: '/operators-detail?tab=documentation&id={{OPERATOR_ID}}',
    as: '/operators/{{OPERATOR_ID}}/documentation'
  }
}, {
  id: 'average-of-observations-by-monitors-visit',
  title: 'Average of observations by monitors visit',
  description: 'There was {{OBSERVATIONS}} observations from {{VISITS}} independent monitor visits',
  letter: '{{OBSERVATIONS_BY_MONITORS}}',
  link: {
    label: 'Find out more',
    href: '/operators-detail?tab=observations&id={{OPERATOR_ID}}',
    as: '/operators/{{OPERATOR_ID}}/observations'
  }
}, {
  id: 'forest-management-units',
  title: 'Forest Management Units',
  description: 'View all the Forest Management Units under management by this operator and access more information about each concession.',
  letter: '{{FMUS}}',
  link: {
    label: 'Read more',
    href: '/operators-detail?tab=fmus&id={{OPERATOR_ID}}',
    as: '/operators/{{OPERATOR_ID}}/fmus'
  }
}];


export default class Gallery1 extends React.Component {
  getData() {
    const { url, operatorsDetail, operatorObservations, operatorDocumentation } = this.props;
    return JSON.parse(substitution(JSON.stringify(data), [
      {
        key: 'OPERATOR_ID',
        value: url.query.id
      }, {
        key: 'DOCUMENTATION',
        value: (operatorDocumentation) ? HELPERS_DOC.getPercentage(operatorsDetail.data) : '-'
      }, {
        key: 'OBSERVATIONS',
        value: (operatorsDetail.data.observations) ? operatorsDetail.data.observations.length : '-'
      }, {
        key: 'VISITS',
        value: (operatorsDetail.data.observations) ? HELPERS_OBS.getMonitorVisits(operatorObservations) : '-'
      }, {
        key: 'OBSERVATIONS_BY_MONITORS',
        value: (operatorsDetail.data.observations) ? HELPERS_OBS.getAvgObservationByMonitors(operatorObservations) : '-'
      }, {
        key: 'FMUS',
        value: (operatorsDetail.data.fmus) ? operatorsDetail.data.fmus.length : '-'
      }
    ]));
  }

  render() {
    return (
      <div className="c-gallery">
        <div className="row l-row">
          {this.getData().map((article, i) => {
            const theme = (i === 0) ? '-secondary' : '-primary';

            return (
              <div
                key={article.id}
                className="columns small-12 medium-4"
              >
                <Card
                  theme={theme}
                  letter={article.letter}
                  title={article.title}
                  description={article.description}
                  link={article.link}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

Gallery1.propTypes = {
  url: PropTypes.object.isRequired,
  operatorsDetail: PropTypes.object.isRequired,
  operatorObservations: PropTypes.array,
  operatorDocumentation: PropTypes.array
};
