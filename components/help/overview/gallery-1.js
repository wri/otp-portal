import React from 'react';

import { HOW_OTP_WORKS_HELP } from 'constants/help';

// Components
import Card from 'components/ui/card';

export default function Gallery1() {
  return (
    <div className="c-gallery">
      <h2 className="c-title">How the Open Timber Portal Works</h2>

      <div className="row custom-row">
        {HOW_OTP_WORKS_HELP.map((article, i) => {
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

Gallery1.propTypes = {};
