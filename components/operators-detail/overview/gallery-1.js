import React from 'react';

// Components
import Card from 'components/ui/card';

export default class Gallery1 extends React.Component {

  data = [{
    id: 'required-documents-uploaded',
    title: 'Required documents uploaded',
    description: 'These key documents evidence compliance with legal framework for forest management',
    letter: '65%',
    link: {
      label: 'Link',
      href: '/operators-detail?tab=documentation&id=26',
      as: '/operators/26/documentation'
    }
  }, {
    id: 'average-of-observations-by-monitors-visit',
    title: 'Average of observations by monitors visit',
    description: 'There was 355 observations from 210 independent monitor visits in 2016',
    letter: '1.69',
    link: {
      label: 'Find out more',
      href: '/operators-detail?tab=observations&id=26',
      as: '/operators/26/observations'
    }
  }, {
    id: 'forest-management-units',
    title: 'Forest Management Units',
    description: 'Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod',
    letter: '7',
    link: {
      label: 'Read more',
      href: '/operators-detail?tab=fmus&id=26',
      as: '/operators/26/fmus'
    }
  }];

  render() {
    return (
      <div className="c-gallery">
        <div className="row custom-row">
          {this.data.map((article, i) => {
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

Gallery1.propTypes = {};
