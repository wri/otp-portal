import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import { getOperator, reloadOperatorDocumentation } from 'modules/operators-detail';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

import useUser from 'hooks/use-user';

const NO_DOC = {};

function DocumentsPublicationAuthorization({ id }) {
  const dispatch = useDispatch();
  // no fallback inside the selector: a new {} each time would re-render on every dispatch
  const doc = useSelector((state) => state.operatorsDetail.publicationAuthorization) || NO_DOC;
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
                onChange={() => dispatch(getOperator(id))}
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
                onChange={() => dispatch(reloadOperatorDocumentation(id, { publicationAuthorization: true }))}
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
