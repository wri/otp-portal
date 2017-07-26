import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

export default function DocumentsByOperator(props) {
  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(props.data);

  return (
    <ul className="c-doc-gallery">
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
  );
}

DocumentsByOperator.defaultProps = {
  data: []
};

DocumentsByOperator.propTypes = {
  data: PropTypes.array
};
