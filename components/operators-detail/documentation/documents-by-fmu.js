import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

export default function DocumentsByFMU(props) {
  const groupedByFmu = HELPERS_DOC.getGroupedByFmu(props.data);

  return (
    <div className="c-accordion">
      {Object.keys(groupedByFmu).map((fmu) => {
        const groupedByCategory = HELPERS_DOC.getGroupedByCategory(groupedByFmu[fmu]);

        return (
          <div key={fmu} className="accordion-item">
            <h3 className="c-title -proximanova -huge -uppercase accordion-title">{fmu}</h3>
            <ul className="c-doc-gallery accordion-content">
              {Object.keys(groupedByCategory).map(category => (
                <li
                  key={category}
                  className="doc-gallery-item"
                >
                  <header>
                    <h3 className="c-title -proximanova -extrabig -uppercase">{category}</h3>
                  </header>

                  <div className="row l-row -equal-heigth">
                    {sortBy(groupedByCategory[category], doc => doc.title).map(card => (
                      <div
                        key={card.id}
                        className="columns small-12 medium-4"
                      >
                        <DocCard
                          {...card}
                        />

                        <DocCardUpload
                          {...card}
                        />
                      </div>
                      ))}
                  </div>
                </li>
                ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

DocumentsByFMU.defaultProps = {
  data: []
};

DocumentsByFMU.propTypes = {
  data: PropTypes.array
};
