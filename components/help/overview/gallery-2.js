import React from 'react';

// Components
import { LEGISLATION_AND_REGULATIONS_HELP } from 'constants/help';

// Components
import Card from 'components/ui/card';

export default function Gallery2() {
  return (
    <div className="c-gallery">
      <h2 className="c-title">Legislation and Regulations</h2>

      <div className="row l-row">
        {LEGISLATION_AND_REGULATIONS_HELP.map((article, i) => {
          const theme = (i === 0) ? '-secondary' : '-primary';

          return (
            <div
              key={article.id}
              className="columns small-12 medium-4"
            >
              <Card
                theme={theme}
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

Gallery2.propTypes = {};
