import React from 'react';

import { TABS_HOW_OTP_WORKS } from 'constants/help';

// Components
import Card from 'components/ui/card';

export default function Gallery1() {
  return (
    <div className="c-gallery">
      <h2 className="c-title">How the Open Timber Portal Works</h2>

      <div className="row custom-row">
        {TABS_HOW_OTP_WORKS.map((article, i) => {
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
