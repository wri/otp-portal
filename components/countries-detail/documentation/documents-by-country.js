import React from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/sortBy";

// Redux
import { connect } from "react-redux";

import { getCountry } from "modules/countries-detail";

// Utils
import { HELPERS_DOC } from "utils/documentation";

// Components
import CountryDocCard from "components/ui/country-doc-card";
import CountryDocCardUpload from "components/ui/country-doc-card-upload";
import ExpandableSection from "components/ui/expandable-section";
import useUser from "hooks/use-user";

function DocumentsByOperator(props) {
  const { data, id } = props;
  const user = useUser();

  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(data);

  const renderDocs = (docs) => {
    return docs.map(card => (
      <div key={card.id} className="columns small-12">
        <CountryDocCard {...card} />

        {user.canManageCountry(id) && (
          <CountryDocCardUpload
            {...card}
            properties={{
              type: 'government',
              id
            }}
            onChange={() => props.getCountry(id)}
          />
        )}
      </div>
    ));
  }

  return (
    <ul className="c-doc-gallery">
      {Object.keys(groupedByCategory).map((category) => {
        const mainCategoryDocs = sortBy(
          groupedByCategory[category].filter(x => x.subCategory === null),
          ['position', 'title']
        );
        const groupedBySubCategory = HELPERS_DOC.getGroupedBySubCategory(groupedByCategory[category].filter(x => x.subCategory));

        return (
          <ExpandableSection
            key={category}
            defaultOpen={false}
            className="doc-gallery-item -top-border c-doc-by-category"
            header={
              <h3 className="c-title -proximanova -extrabig -uppercase">
                {category}
              </h3>
            }
          >
            <div className="c-doc-gallery-fmu-docs">
              {mainCategoryDocs.length > 0 && (
                <div className="doc-gallery-producer-docs row l-row -equal-heigth">
                  {renderDocs(mainCategoryDocs)}
                </div>
              )}

              {Object.keys(groupedBySubCategory).map((subCategory) => {
                const docs = sortBy(groupedBySubCategory[subCategory], ['position', 'title'])

                return (
                  <div key={subCategory} className="subcategory-item">
                    <div className="doc-by-category-desc">
                      <h4>{subCategory}</h4>
                    </div>

                    {docs.length > 0 && (
                      <div className="doc-gallery-producer-docs row l-row -equal-heigth">
                        {renderDocs(docs)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ExpandableSection>
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
};

export default connect(
  null,
  { getCountry }
)(DocumentsByOperator);
