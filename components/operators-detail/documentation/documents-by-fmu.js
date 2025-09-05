import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import { useIntl } from 'react-intl';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';
import useUser from 'hooks/use-user';

function DocumentsByFMU({ documents, id, getOperator }) {
  const intl = useIntl();
  const user = useUser();

  return (
    <div className="c-doc-gallery-fmu-docs">
      <h3>{intl.formatMessage({ id: 'fmus-documents' })}:</h3>
      {Object.values(documents).map((docs) => {
        const FMUname = docs[0].fmu.name;

        return (
          <div className="fmu-item" key={docs[0].fmu.name}>
            <div className="doc-gallery-item-header">
              <div className="doc-by-category-desc">
                <h4>{FMUname}</h4>
              </div>
            </div>

            <div className="row l-row -equal-heigth">
              {sortBy(docs, ['position', 'title']).map((card) => (
                <div key={card.id} className="columns small-12 medium-4">
                  <DocCard
                    {...card}
                    properties={{
                      type: 'operator',
                      id,
                    }}
                    onChange={() => getOperator(id)}
                  />
                  {user.canManageOperator(id) && (
                    <DocCardUpload
                      {...card}
                      properties={{
                        type: 'operator',
                        id,
                      }}
                      user={user}
                      onChange={() => getOperator(id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

DocumentsByFMU.propTypes = {
  documents: PropTypes.object,
  id: PropTypes.string,
  getOperator: PropTypes.func
};

export default DocumentsByFMU;
