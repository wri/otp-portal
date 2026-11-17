import React from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'utils/general';

import { useIntl } from 'react-intl';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';
import useUser from 'hooks/use-user';

function DocumentsByFMU({ documents, id, onChange }) {
  const intl = useIntl();
  const user = useUser();

  return (
    <div className="c-doc-gallery-fmu-docs">
      <h3>{intl.formatMessage({ id: 'fmus-documents' })}:</h3>
      {Object.values(documents).map((docs) => {
        const FMUname = docs[0].fmu.name;

        return (
          <div className="fmu-item" key={docs[0].fmu.name}>
            <div className="doc-by-category-desc">
              <h4>{FMUname}</h4>
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
                    onChange={onChange}
                  />
                  {user.canManageOperator(id) && (
                    <DocCardUpload
                      {...card}
                      properties={{
                        type: 'operator',
                        id,
                      }}
                      onChange={onChange}
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
  onChange: PropTypes.func
};

export default DocumentsByFMU;
