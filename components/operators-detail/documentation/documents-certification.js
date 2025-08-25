import React from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'utils/general';

// Redux
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';

import { getOperator, getOperatorDocumentation, getOperatorPublicationAuthorization, getOperatorTimeline } from 'modules/operators-detail';

// Components
import DocCard from 'components/ui/doc-card';
import DocCardUpload from 'components/ui/doc-card-upload';

import { getContractSignatureDocumentation } from 'selectors/operators-detail/documentation';

function DocumentsCertification(props) {
  const { doc, user, id } = props;
  const intl = useIntl();
  const { status } = doc;

  const isLogged =
    (user && user.role === 'admin') ||
      (user &&
        (user.role === 'operator' || user.role === 'holding') &&
        user.operator_ids &&
        user.operator_ids.includes(+id));

  if (!isLogged || isEmpty(doc)) {
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
                onChange={() => props.getOperator(id)}
              />

              {((user && user.role === 'admin') ||
                (user &&
                  (user.role === 'operator' || user.role === 'holding') &&
                  user.operator_ids &&
                  user.operator_ids.includes(+id))) && (
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
                      user={user}
                      onChange={() => {
                        props.getOperator(id);
                        props.getOperatorDocumentation(id);
                        props.getOperatorTimeline(id);
                        props.getOperatorPublicationAuthorization(id);
                      }}
                    />
              )}
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

DocumentsCertification.defaultProps = {};

DocumentsCertification.propTypes = {
  doc: PropTypes.shape({}),
  id: PropTypes.string,
  user: PropTypes.object,
  getOperator: PropTypes.func,
  getOperatorDocumentation: PropTypes.func,
  getOperatorTimeline: PropTypes.func,
  getOperatorPublicationAuthorization: PropTypes.func,
};

export default connect(
  (state) => ({
    user: state.user,
    doc: getContractSignatureDocumentation(state),
  }),
  { getOperator, getOperatorDocumentation, getOperatorTimeline, getOperatorPublicationAuthorization }
)(DocumentsCertification);
