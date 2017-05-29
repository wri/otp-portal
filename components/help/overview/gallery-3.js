import React from 'react';

// Components
import { TABS_FAQS } from 'constants/help';

// Components
import Card from 'components/ui/card';

export default function Gallery3() {
  return (
    <div className="c-gallery">
      <h2 className="c-title">FAQs</h2>

      <div className="row custom-row">
        {TABS_FAQS.map((article, i) => {
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

Gallery3.propTypes = {};
