import React from "react";
import PropTypes from "prop-types";
import sortBy from "lodash/sortBy";
import groupBy from "lodash/groupBy";

// Redux
import { connect } from "react-redux";

import { getOperator } from "modules/operators-detail";

// Utils
import { HELPERS_DOC } from "utils/documentation";

// Components
import DocCard from "components/ui/doc-card";
import DocCardUpload from "components/ui/doc-card-upload";

function DocumentsByOperator({ data, user, id, ...props }) {
  const groupedByCategory = HELPERS_DOC.getGroupedByCategory(data);
  const max = HELPERS_DOC.getMaxLength(groupedByCategory);

  return (
    <ul className="c-doc-gallery">
      {Object.keys(groupedByCategory).map((category) => {
        const groupedByStatus = HELPERS_DOC.getGroupedByStatus(
          groupedByCategory[category]
        );
        const width = `${(groupedByCategory[category].length / max) * 100}%`;
        const producerDocs = groupedByCategory[category].filter(
          (doc) => doc.type === "operator-document-countries"
        );
        const FMUDocs = groupedByCategory[category].filter(
          (doc) => doc.type === "operator-document-fmus"
        );
        const FMUDocsByFMU = groupBy(FMUDocs, "fmu.id");

        return (
          <li key={category} className="doc-gallery-item c-doc-by-category">
            <details>
              <summary>
                <header>
                  <div className="doc-by-category-chart">
                    <div className="doc-by-category-bar" style={{ width }}>
                      {sortBy(Object.keys(groupedByStatus)).map((status) => {
                        const segmentWidth = `${
                          (groupedByStatus[status].length /
                            groupedByCategory[category].length) *
                          100
                        }%`;
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

              {producerDocs.length > 0 && (
                <div>
                  <h3>Producer Documents:</h3>
                  <div className="row l-row -equal-heigth">
                    {sortBy(producerDocs, (doc) => doc.title).map((card) => (
                      <div key={card.id} className="columns small-12 medium-4">
                        <DocCard
                          {...card}
                          properties={{
                            type: "operator",
                            id,
                          }}
                          onChange={() => props.getOperator(id)}
                        />

                        {((user && user.role === "admin") ||
                          (user &&
                            user.role === "operator" &&
                            user.operator &&
                            user.operator.toString() === id)) && (
                          <DocCardUpload
                            {...card}
                            properties={{
                              type: "operator",
                              id,
                            }}
                            user={user}
                            onChange={() => props.getOperator(id)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {FMUDocs.length > 0 && (
                <div>
                  <h3>FMU Documents:</h3>
                  {Object.values(FMUDocsByFMU).map((docs) => (
                    <details>
                      <summary>
                        <h4>{docs[0].fmu.name}</h4>
                      </summary>
                      <div className="row l-row -equal-heigth">
                        {sortBy(docs, (doc) => doc.title).map((card) => (
                          <div
                            key={card.id}
                            className="columns small-12 medium-4"
                          >
                            <DocCard
                              {...card}
                              properties={{
                                type: "operator",
                                id,
                              }}
                              onChange={() => props.getOperator(id)}
                            />

                            {((user && user.role === "admin") ||
                              (user &&
                                user.role === "operator" &&
                                user.operator &&
                                user.operator.toString() === id)) && (
                              <DocCardUpload
                                {...card}
                                properties={{
                                  type: "operator",
                                  id,
                                }}
                                user={user}
                                onChange={() => props.getOperator(id)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </details>
          </li>
        );
      })}
    </ul>
  );
}

DocumentsByOperator.defaultProps = {
  data: [],
};

DocumentsByOperator.propTypes = {
  data: PropTypes.array,
  id: PropTypes.string,
  user: PropTypes.object,
};

export default connect(
  (state) => ({
    user: state.user,
  }),
  { getOperator }
)(DocumentsByOperator);
