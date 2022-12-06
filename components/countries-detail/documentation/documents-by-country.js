import React, { useState } from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/sortBy";
import cx from 'classnames';

// Redux
import { connect } from "react-redux";
import { injectIntl, intlShape } from 'react-intl';

import { getCountry } from "modules/countries-detail";

// Utils
import { HELPERS_DOC } from "utils/documentation";

// Components
import CountryDocCard from "components/ui/country-doc-card";
import CountryDocCardUpload from "components/ui/country-doc-card-upload";

function DocumentsByOperator(props) {
  const { data, user, id, intl } = props;

  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(data);

  const [categoriesOpen, setCategoriesOpen] = useState(
    Object.keys(groupedByCategory).reduce(
      (acc, cat) => ({ ...acc, [cat]: false }),
      {}
    )
  );

  const renderDocs = (docs) => {
    return docs.map(card => (
      <div key={card.id} className="columns small-12 medium-4">
        <CountryDocCard
          {...card}
          properties={{
            type: 'government',
            id
          }}
          onChange={() => props.getCountry(id)}
        />

        {((user && user.role === 'admin') ||
          (user && user.role === 'government' && user.country && user.country.toString() === id)) && (
            <CountryDocCardUpload
              {...card}
              properties={{
                type: 'government',
                id
              }}
              user={user}
              onChange={() => props.getCountry(id)}
            />
        )}
      </div>
    ));
  }

  return (
    <ul className="c-doc-gallery">
      {Object.keys(groupedByCategory).map((category) => {
        const isCategoryOpen = categoriesOpen[category];
        /* const docs = sortBy(groupedByCategory[category], ['position', 'title']) */
        const mainCategoryDocs = sortBy(
          groupedByCategory[category].filter(x => x.subCategory === null),
          ['position', 'title']
        );
        const groupedBySubCategory = HELPERS_DOC.getGroupedBySubCategory(groupedByCategory[category].filter(x => x.subCategory));

        return (
          <li key={category} className="doc-gallery-item c-doc-by-category">
            <header className="doc-gallery-item-header">
              <h3 className="c-title -proximanova -extrabig -uppercase">
                {category}
              </h3>
              <button
                className={cx('doc-by-category-btn -proximanova', {
                  open: isCategoryOpen,
                })}
                onClick={() =>
                  setCategoriesOpen({
                    ...categoriesOpen,
                    [category]: !isCategoryOpen,
                  })
                }
              >
                {isCategoryOpen ? intl.formatMessage({ id: 'collapse' }) : intl.formatMessage({ id: 'expand' })}
              </button>
            </header>

            {isCategoryOpen && (
              <div className="c-doc-gallery-fmu-docs">
                {mainCategoryDocs.length > 0 && (
                  <div className="doc-gallery-producer-docs row l-row -equal-heigth">
                    {renderDocs(mainCategoryDocs)}
                  </div>
                )}

                {Object.keys(groupedBySubCategory).map((subCategory) => {
                  const docs = sortBy(groupedBySubCategory[subCategory], ['position', 'title'])

                  return (
                    <div className="subcategory-item">
                      <div className="doc-gallery-item-header">
                        <div className="doc-by-category-desc">
                          <h4>{subCategory}</h4>
                        </div>
                      </div>

                      {docs.length > 0 && isCategoryOpen && (
                        <div className="doc-gallery-producer-docs row l-row -equal-heigth">
                          {renderDocs(docs)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  );
}

DocumentsByOperator.defaultProps = {
  data: []
};

DocumentsByOperator.propTypes = {
  data: PropTypes.array,
  id: PropTypes.string,
  user: PropTypes.object,
  intl: intlShape
};

export default injectIntl(
  connect(
    state => ({
      user: state.user
    }),
    { getCountry }
  )(DocumentsByOperator)
);
