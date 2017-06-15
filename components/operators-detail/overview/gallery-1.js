import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { substitution } from 'utils/text';

// Components
import Card from 'components/ui/card';

const data = [{
  id: 'required-documents-uploaded',
  title: 'Required documents uploaded',
  description: 'These key documents evidence compliance with legal framework for forest management',
  letter: '{{DOCUMENTATION}}',
  link: {
    label: 'Link',
    href: '/operators-detail?tab=documentation&id={{OPERATOR_ID}}',
    as: '/operators/{{OPERATOR_ID}}/documentation'
  }
}, {
  id: 'average-of-observations-by-monitors-visit',
  title: 'Average of observations by monitors visit',
  description: 'There was 355 observations from 210 independent monitor visits in 2016',
  letter: '{{OBSERVATIONS_BY_MONITORS}}',
  link: {
    label: 'Find out more',
    href: '/operators-detail?tab=observations&id={{OPERATOR_ID}}',
    as: '/operators/{{OPERATOR_ID}}/observations'
  }
}, {
  id: 'forest-management-units',
  title: 'Forest Management Units',
  description: 'Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod',
  letter: '{{FMUS}}',
  link: {
    label: 'Read more',
    href: '/operators-detail?tab=fmus&id={{OPERATOR_ID}}',
    as: '/operators/{{OPERATOR_ID}}/fmus'
  }
}];


export default class Gallery1 extends React.Component {
  getData() {
    const { url, operatorsDetail } = this.props;
    return JSON.parse(substitution(JSON.stringify(data), [
      {
        key: 'OPERATOR_ID',
        value: url.query.id
      }, {
        key: 'DOCUMENTATION',
        value: '65%'
      }, {
        key: 'OBSERVATIONS_BY_MONITORS',
        value: '1.49'
      }, {
        key: 'FMUS',
        value: (operatorsDetail.data.fmus) ? operatorsDetail.data.fmus.length : '-'
      }
    ]));
  }

  render() {
    return (
      <div className="c-gallery">
        <div className="row custom-row">
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
  operatorsDetail: PropTypes.object.isRequired
};
