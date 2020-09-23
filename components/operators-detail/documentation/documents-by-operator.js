import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

// Redux
import { connect } from 'react-redux';

import { getOperator } from 'modules/operators-detail';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

function DocumentsByOperator(props) {
  const { data, user, id } = props;

  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(data);
  const max = HELPERS_DOC.getMaxLength(groupedByCategory);

  return (
    <ul className="c-doc-gallery">
      {Object.keys(groupedByCategory).map((category) => {
        const groupedByStatus =
          HELPERS_DOC.getGroupedByStatus(groupedByCategory[category]);
        const width = `${(groupedByCategory[category].length / max) * 100}%`;

        return (
          <li key={category} className="doc-gallery-item c-doc-by-category">
            <details>
              <summary>
                <header>
                  <div className="doc-by-category-chart">
                    <div
                      className="doc-by-category-bar"
                      style={{ width }}
                    >
                      {sortBy(Object.keys(groupedByStatus)).map((status) => {
                        const segmentWidth = `${(groupedByStatus[status].length /
                          groupedByCategory[category].length) * 100}%`;
                        return (
                          <div
                            key={status}
                            className={`doc-by-category-bar-segment -${status}`}
                            style={{ width: segmentWidth }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <h3 className="c-title -proximanova -extrabig -uppercase">
                    {category}
                  </h3>
                </header>
              </summary>

              <div className="row l-row -equal-heigth">
                {sortBy(groupedByCategory[category], doc => doc.title).map(card => (
                  <div key={card.id} className="columns small-12 medium-4">
                    <DocCard
                      {...card}
                      properties={{
                        type: 'operator',
                        id
                      }}
                      onChange={() => props.getOperator(id)}
                    />

                    {((user && user.role === 'admin') ||
                      (user && user.role === 'operator' && user.operator && user.operator.toString() === id)) && (
                        <DocCardUpload
                          {...card}
                          properties={{
                            type: 'operator',
                            id
                          }}
                          user={user}
                          onChange={() => props.getOperator(id)}
                        />
                    )}
                  </div>
                ))}
              </div>
            </details>
          </li>
        );
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
  user: PropTypes.object
};

export default connect(
  state => ({
    user: state.user
  }),
  { getOperator }
)(DocumentsByOperator);
