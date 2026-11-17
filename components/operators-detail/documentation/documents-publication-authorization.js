import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

import { useIntl } from 'react-intl';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

import { useOperatorDetail } from 'components/operators-detail/layout';
import useUser from 'hooks/use-user';

const NO_DOC = {};

function DocumentsPublicationAuthorization({ id }) {
  const { operatorsDetail, reload } = useOperatorDetail();
  const doc = operatorsDetail.publicationAuthorization || NO_DOC;
  const intl = useIntl();
  const user = useUser();
  const { status } = doc;

  if (!user.canManageOperator(id) || isEmpty(doc)) {
    return null;
  }

  return (
    <div className="c-doc-license-agreement">
      <ul className="c-doc-gallery">
        <li className="doc-gallery-item">
          <header>
            <h3 className="c-title -proximanova -extrabig -uppercase">
              {intl.formatMessage({ id: 'operator-detail.license' })}
            </h3>
            <p>
              {status !== 'doc_not_provided' && intl.formatMessage({ id: `operator-detail.license.${status}` })}
              {status === 'doc_not_provided' && intl.formatMessage(
                { id: `operator-detail.license.doc_not_provided` },
                { a: (chunks) => <a href="https://opentimberportal.org/static/pdf/AUTORISATION-ENTREPRISES-FINALE.pdf" target="_blank">{chunks}</a> }
              )}
            </p>
          </header>

          <div className="row l-row -equal-heigth">
            <div className="columns small-12">
              <DocCard
                {...doc}
                title={intl.formatMessage({ id: 'operator-detail.license' })}
                properties={{
                  type: 'operator',
                  id,
                }}
                layout={{
                  info: false,
                  annexes: false,
                }}
                onChange={reload}
              />

              <DocCardUpload
                {...doc}
                title={intl.formatMessage({ id: 'operator-detail.license' })}
                properties={{
                  type: 'operator',
                  id,
                }}
                buttons={{
                  add: true,
                  update: true,
                  delete: true,
                  not_required: false,
                }}
                onChange={reload}
              />
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}


DocumentsPublicationAuthorization.propTypes = {
  id: PropTypes.string,
};

export default DocumentsPublicationAuthorization;
