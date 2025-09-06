import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as Sentry from '@sentry/nextjs';

// Intl
import { useIntl } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import ConfirmModal from 'components/ui/confirm-modal';
import DocAnnexesModal from 'components/ui/doc-annexes-modal';
import DocAnnex from 'components/ui/doc-annex';
import Icon from 'components/ui/icon';
import useUser from 'hooks/use-user';

const DocCard = (props) => {
  const intl = useIntl();
  const user = useUser();
  const [annexTooltipVisible, setAnnexTooltipVisible] = useState(undefined);
  const { url, status, public: publicState, title, reason, source, sourceInfo, explanation, adminComment, startDate, endDate, properties, annexes, layout, onChange } = props;

  const documentationService = useMemo(() => new DocumentationService({
    authorization: user.token
  }), [user.token]);

  const triggerWhy = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: () => (
        <div className="c-doc-info-modal">
          <h2>{title}</h2>
          <p>
            {reason}
          </p>
        </div>
      )
    });
  };

  const triggerDocInvalidExplanation = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: () => (
        <div className="c-doc-info-modal">
          <h2>{intl.formatMessage({ id: "operator-detail.documents.not_published", defaultMessage: "Your document was not published" })}</h2>
          <p>
            {intl.formatMessage({
              id: "operator-detail.documents.not_published_reason",
              defaultMessage: "The OTP quality control could not approve the publication of this document because:"
            })}
          </p>
          <p className="c-doc-info-modal__comment">
            {adminComment}
          </p>
        </div>
      )
    });
  };

  const triggerDocInfo = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: () => (
        <div className="c-doc-info-modal">
          <h2>{title}</h2>
          <p>
            {explanation}
          </p>
        </div>
      )
    });
  };

  const triggerAddAnnexModal = () => {
    modal.toggleModal(true, {
      children: DocAnnexesModal,
      childrenProps: {
        ...props,
        onChange: () => {
          onChange && onChange();
        }
      }
    });
  };

  const triggerRemoveAnnex = (id) => {
    const annex = annexes.find(a => a.id === id);

    // workaround to close tooltip before opening modal, but show it again when hovering
    setAnnexTooltipVisible(false);
    setTimeout(() => {
      setAnnexTooltipVisible(undefined);
    });

    modal.toggleModal(true, {
      children: ConfirmModal,
      childrenProps: {
        title: intl.formatMessage({ id: 'delete.document.title', defaultMessage: 'Delete {document}?' }, { document: annex.name }),
        text: intl.formatMessage(
          { id: 'delete.document.text', defaultMessage: 'Are you sure you want to delete document {document}?' }, { document: annex.name }
        ),
        confirmText: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        onConfirm: (options) => {
          triggerConfirmedRemoveAnnex({ ...options, annexId: id });
        },
        onCancel: () => modal.toggleModal(false),
      },
      size: '-small'
    });
  };

  const triggerConfirmedRemoveAnnex = ({ annexId, onSuccess, onError } = {}) => {
    documentationService.deleteAnnex(annexId)
      .then(() => {
        modal.toggleModal(false);
        onSuccess && onSuccess();
        onChange && onChange();
      })
      .catch((err) => {
        onError && onError(
          intl.formatMessage({ id: 'document.delete.error', defaultMessage: 'An error occurred while deleting the document.' })
        );
        Sentry.captureException(err);
        console.error(err);
      });
  };

  const { id } = properties;
  const isActiveUser = user.canManageOperator(id) || user.canManageCountry(id);
  const approvedAnnexes = annexes.filter(a => a.name);

  const classNames = classnames({
    [`-${status}`]: !!status
  });

  return (
    <div className={`c-doc-card ${classNames}`}>
      {!publicState && isActiveUser &&
        <div className="doc-card-private">
          {intl.formatMessage({ id: 'private' })}
        </div>
      }

      {layout.info &&
        <div className="doc-card-info">
          <button className="c-button -clean -icon" aria-label="Show document information" onClick={triggerDocInfo}>
            <Icon
              name="icon-info"
              className="-smaller"
            />
          </button>
        </div>
      }

      {!!url && status !== 'doc_not_provided' && status !== 'doc_not_required' &&
        <div className="doc-card-content-container">
          <header className="doc-card-header">
            {startDate !== endDate &&
              <div className="doc-card-date">
                <span>
                  {intl.formatMessage({ id: 'expiration' })}:
                </span>
                <span className="-date">
                  {intl.formatDate(endDate, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            }
            {(status !== 'doc_invalid' || !adminComment) && (
              <div className="doc-card-status">
                {intl.formatMessage({ id: status })}
              </div>
            )}
            {status === 'doc_invalid' && adminComment && (
              <div className="doc-card-status -why" onClick={triggerDocInvalidExplanation}>
                {intl.formatMessage({ id: status })} <br />
                See why
              </div>
            )}
          </header>
          <div className="doc-card-content">
            <a target="_blank" href={url}>
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
            </a>
          </div>
          <div className="doc-card-footer">
            {source && (
              <div className="doc-card-source -with-separator">
                <span>{intl.formatMessage({ id: 'source' })}:</span>
                {' '}
                <span className="-source">{source !== 'other_source' ? intl.formatMessage({ id: source }) : sourceInfo}</span>
              </div>
            )}

            {layout.annexes && (isActiveUser || (!isActiveUser && !!approvedAnnexes.length)) &&
              <div className="doc-card-annexes">
                <div className="doc-card-annexes-title">{intl.formatMessage({ id: 'annexes' })}:</div>

                <ul className="doc-card-list">
                  {approvedAnnexes.map(annex => (
                    <li className="doc-card-list-item" key={annex.id}>
                      <DocAnnex annex={annex} showRemoveButton={isActiveUser} onRemove={triggerRemoveAnnex} visible={annexTooltipVisible} />
                    </li>
                  ))}
                  {isActiveUser &&
                    <li className="doc-card-list-button" key="add-annex">
                      <button
                        className="c-button -small -secondary"
                        type="button"
                        data-test-id="add-annex-button"
                        onClick={triggerAddAnnexModal}
                      >
                        <span className="doc-card-hidden-button-text">Add an annex</span>
                        <Icon className="" name="icon-plus" />
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      }

      {!url && status !== 'doc_not_provided' && status !== 'doc_not_required' &&
        <div>
          <header className="doc-card-header">
            {startDate !== endDate &&
              <div className="doc-card-date">
                <span>
                  {intl.formatMessage({ id: 'expiration' })}:
                </span>
                <span className="-date">
                  {intl.formatDate(endDate, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            }
            {(status !== 'doc_invalid' || !adminComment) && (
              <div className="doc-card-status">
                {intl.formatMessage({ id: status })}
              </div>
            )}
            {status === 'doc_invalid' && adminComment && (
              <div className="doc-card-status -why" onClick={triggerDocInvalidExplanation}>
                {intl.formatMessage({ id: status })} <br />
                See why
              </div>
            )}
          </header>
          <div className="doc-card-content">
            <h3 className="doc-card-title c-title -big">
              {title}
            </h3>
          </div>
          <div className="doc-card-footer">
            {source && (
              <div className="doc-card-source">
                <span>{intl.formatMessage({ id: 'source' })}:</span>
                {' '}
                <span className="-source">{source !== 'other_source' ? intl.formatMessage({ id: source }) : sourceInfo}</span>
              </div>
            )}

            {layout.annexes && (isActiveUser || (!isActiveUser && !!approvedAnnexes.length)) &&
              <div className="doc-card-annexes">
                <div className="doc-card-annexes-title">{intl.formatMessage({ id: 'annexes' })}:</div>

                <ul className="doc-card-list">
                  {approvedAnnexes.map(annex => (
                    <li className="doc-card-list-item" key={annex.id}>
                      <DocAnnex annex={annex} showRemoveButton={isActiveUser} onRemove={triggerRemoveAnnex} visible={annexTooltipVisible} />
                    </li>
                  ))}
                  {isActiveUser &&
                    <li className="doc-card-list-button" key="add-annex">
                      <button
                        className="c-button -small -secondary"
                        type="button"
                        onClick={triggerAddAnnexModal}
                      >
                        <span className="doc-card-hidden-button-text">Add an annex</span>
                        <Icon className="" name="icon-plus" />
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }

          </div>
        </div>
      }

      {status === 'doc_not_provided' &&
        <div>
          <header className="doc-card-header">
            <div className="doc-card-status">{intl.formatMessage({ id: status })}</div>
          </header>
          <div className="doc-card-content">
            <h3 className="doc-card-title c-title -big">
              {title}
            </h3>
          </div>
        </div>
      }

      {status === 'doc_not_required' &&
        <div className="doc-card-content-container">
          <header className="doc-card-header">
            <div className="doc-card-status">{intl.formatMessage({ id: status })}</div>
            <div className="doc-card-status -why">
              <div onClick={triggerWhy}>
                {intl.formatMessage({ id: 'why' })}
              </div>
            </div>
          </header>
          <div className="doc-card-content">
            <h3 className="doc-card-title c-title -big">
              {title}
            </h3>
          </div>
          <div className="doc-card-footer">
            {source && (
              <div className="doc-card-source">
                <span>{intl.formatMessage({ id: 'source' })}:</span>
                {' '}
                <span className="-source">{source !== 'other_source' ? intl.formatMessage({ id: source }) : sourceInfo}</span>
              </div>
            )}

            {layout.annexes && (isActiveUser || (!isActiveUser && !!approvedAnnexes.length)) &&
              <div className="doc-card-annexes">
                <div className="doc-card-annexes-title">{intl.formatMessage({ id: 'annexes' })}:</div>

                <ul className="doc-card-list">
                  {approvedAnnexes.map(annex => (
                    <li className="doc-card-list-item" key={annex.id}>
                      <DocAnnex annex={annex} showRemoveButton={isActiveUser} onRemove={triggerRemoveAnnex} visible={annexTooltipVisible} />
                    </li>
                  ))}

                  {isActiveUser &&
                    <li className="doc-card-list-button" key="add-annex">
                      <button
                        className="c-button -small -secondary"
                        type="button"
                        onClick={triggerAddAnnexModal}
                      >
                        <span className="doc-card-hidden-button-text">Add an annex</span>
                        <Icon className="" name="icon-plus" />
                      </button>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      }
    </div>
  );
};

DocCard.propTypes = {
  url: PropTypes.string,
  status: PropTypes.string,
  public: PropTypes.bool,
  title: PropTypes.string,
  reason: PropTypes.string,
  source: PropTypes.string,
  sourceInfo: PropTypes.string,
  explanation: PropTypes.string,
  adminComment: PropTypes.string,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  properties: PropTypes.object,
  annexes: PropTypes.array,
  layout: PropTypes.shape({}),
  onChange: PropTypes.func
};

DocCard.defaultProps = {
  annexes: [],
  layout: {
    info: true,
    annexes: true
  }
};

export default DocCard;
