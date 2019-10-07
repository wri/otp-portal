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

function DocumentsByOperator(props) {
  const { data, user, id } = props;

  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(data);

  return (
    <ul className="c-doc-gallery">
      {Object.keys(groupedByCategory).map(category => (
        <li key={category} className="doc-gallery-item">
          <header>
            <h3 className="c-title -proximanova -extrabig -uppercase">
              {category}
            </h3>
          </header>

          <div className="row l-row -equal-heigth">
            {sortBy(groupedByCategory[category], doc => doc.title).map(card => (
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
  data: PropTypes.array,
  id: PropTypes.string,
  user: PropTypes.object
};

export default connect(
  state => ({
    user: state.user
  }),
  { getCountry }
)(DocumentsByOperator);
