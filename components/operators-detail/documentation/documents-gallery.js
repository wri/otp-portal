import React from 'react';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';

// Components
import DocCard from 'components/ui/doc-card';

export default class DocumentsGallery extends React.Component {

  getGroupedByCategory() {
    // TODO: replace to a reseselect from the documentation asociated to an operator
    return groupBy(this.props.data, 'category');
  }

  render() {
    const groupedByCategory = this.getGroupedByCategory();

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

            <div className="row custom-row">
              {groupedByCategory[category].map(card => (
                <div
                  key={card.id}
                  className="columns small-12 medium-4"
                >
                  <DocCard
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
}

DocumentsGallery.propTypes = {
  data: PropTypes.array
};
