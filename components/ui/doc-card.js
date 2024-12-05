import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import DocAnnexesModal from 'components/ui/doc-annexes-modal';
import DocAnnex from 'components/ui/doc-annex';
import Icon from 'components/ui/icon';

class DocCard extends React.Component {
  static propTypes = {
    user: PropTypes.object,
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
    intl: PropTypes.object.isRequired,
    onChange: PropTypes.func
  };

  static defaultProps = {
    annexes: [],
    layout: {
      info: true,
      annexes: true
    }
  }

  constructor(props) {
    super(props);

    this.documentationService = new DocumentationService({
      authorization: props.user.token
    });
  }

  state = {
    deleteLoading: false
  }


  triggerWhy = (e) => {
    e && e.preventDefault();
    const { title, reason } = this.props;

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
  }

  triggerDocInvalidExplanation = (e) => {
    e && e.preventDefault();
    const { intl, adminComment } = this.props;

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
  }

  triggerDocInfo = (e) => {
    e && e.preventDefault();
    const { title, explanation } = this.props;

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
  }

  triggerAddAnnexModal = () => {
    modal.toggleModal(true, {
      children: DocAnnexesModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }

    });
  }

  triggerRemoveAnnex = (id) => {
    this.setState({ deleteLoading: true });

    this.documentationService.deleteAnnex(id)
      .then(() => {
        this.setState({ deleteLoading: false });
        this.props.onChange && this.props.onChange();
      })
      .catch((err) => {
        this.setState({ deleteLoading: false });
        console.error(err);
      });
  }

  render() {
    const { user, adminComment, public: publicState, startDate, endDate, status, source, sourceInfo, title, explanation, url, annexes, layout, properties } = this.props;
    const { id } = properties;
    const { deleteLoading } = this.state;
    const isActiveUser = (user && user.role === 'admin') ||
      (user && (user.role === 'operator' || user.role === 'holding') && user.operator_ids && user.operator_ids.includes(+id)) ||
      (user && user.role === 'government' && user.country && user.country.toString() === id);

    const approvedAnnexes = annexes.filter(a => a.name);

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card ${classNames}`}>
        {!publicState && isActiveUser &&
          <div className="doc-card-private">
            {this.props.intl.formatMessage({ id: 'private' })}
          </div>
        }

        {layout.info &&
          <div className="doc-card-info">
            <button className="c-button -clean -icon" aria-label="Show document information" onClick={this.triggerDocInfo}>
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
                    {this.props.intl.formatMessage({ id: 'expiration' })}:
                  </span>
                  <span className="-date">
                    {this.props.intl.formatDate(endDate, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              }
              {(status !== 'doc_invalid' || !adminComment) && (
                <div className="doc-card-status">
                  {this.props.intl.formatMessage({ id: status })}
                </div>
              )}
              {status === 'doc_invalid' && adminComment && (
                <div className="doc-card-status -why" onClick={this.triggerDocInvalidExplanation}>
                  {this.props.intl.formatMessage({ id: status })} <br />
                  See why
                </div>
              )}
            </header>
            <div className="doc-card-content">
              <a rel="noopener noreferrer" target="_blank" href={url}>
                <h3 className="doc-card-title c-title -big">
                  {title}
                </h3>
              </a>
            </div>
            <div className="doc-card-footer">
              {source && (
                <div className="doc-card-source -with-separator">
                  <span>{this.props.intl.formatMessage({ id: 'source' })}:</span>
                  {' '}
                  <span className="-source">{source !== 'other_source' ? this.props.intl.formatMessage({ id: source }) : sourceInfo}</span>
                </div>
              )}

              {layout.annexes && (isActiveUser || (!isActiveUser && !!approvedAnnexes.length)) &&
                <div className="doc-card-annexes">
                  <div className="doc-card-annexes-title">{this.props.intl.formatMessage({ id: 'annexes' })}:</div>

                  <ul className="doc-card-list">
                    {approvedAnnexes.map(annex => (
                      <li className="doc-card-list-item" key={annex.id}>
                        <DocAnnex annex={annex} isRemoving={deleteLoading} showRemoveButton={isActiveUser} onRemove={this.triggerRemoveAnnex} />
                      </li>
                    ))}
                    {isActiveUser &&
                      <li className="doc-card-list-button" key="add-annex">
                        <button
                          className="c-button -small -secondary"
                          type="button"
                          data-test-id="add-annex-button"
                          onClick={this.triggerAddAnnexModal}
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
                    {this.props.intl.formatMessage({ id: 'expiration' })}:
                  </span>
                  <span className="-date">
                    {this.props.intl.formatDate(endDate, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              }
              {(status !== 'doc_invalid' || !adminComment) && (
                <div className="doc-card-status">
                  {this.props.intl.formatMessage({ id: status })}
                </div>
              )}
              {status === 'doc_invalid' && adminComment && (
                <div className="doc-card-status -why" onClick={this.triggerDocInvalidExplanation}>
                  {this.props.intl.formatMessage({ id: status })} <br />
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
                  <span>{this.props.intl.formatMessage({ id: 'source' })}:</span>
                  {' '}
                  <span className="-source">{source !== 'other_source' ? this.props.intl.formatMessage({ id: source }) : sourceInfo}</span>
                </div>
              )}

              {layout.annexes && (isActiveUser || (!isActiveUser && !!approvedAnnexes.length)) &&
                <div className="doc-card-annexes">
                  <div className="doc-card-annexes-title">{this.props.intl.formatMessage({ id: 'annexes' })}:</div>

                  <ul className="doc-card-list">
                    {approvedAnnexes.map(annex => (
                      <li className="doc-card-list-item" key={annex.id}>
                        <DocAnnex annex={annex} isRemoving={deleteLoading} showRemoveButton={isActiveUser} onRemove={this.triggerRemoveAnnex} />
                      </li>
                    ))}
                    {isActiveUser &&
                      <li className="doc-card-list-button" key="add-annex">
                        <button
                          className="c-button -small -secondary"
                          type="button"
                          onClick={this.triggerAddAnnexModal}
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
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
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
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
              <div className="doc-card-status -why">
                <div onClick={this.triggerWhy}>
                  {this.props.intl.formatMessage({ id: 'why' })}
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
                  <span>{this.props.intl.formatMessage({ id: 'source' })}:</span>
                  {' '}
                  <span className="-source">{source !== 'other_source' ? this.props.intl.formatMessage({ id: source }) : sourceInfo}</span>
                </div>
              )}

              {layout.annexes && (isActiveUser || (!isActiveUser && !!approvedAnnexes.length)) &&
                <div className="doc-card-annexes">
                  <div className="doc-card-annexes-title">{this.props.intl.formatMessage({ id: 'annexes' })}:</div>

                  <ul className="doc-card-list">
                    {approvedAnnexes.map(annex => (
                      <li className="doc-card-list-item" key={annex.id}>
                        <DocAnnex annex={annex} isRemoving={deleteLoading} showRemoveButton={isActiveUser} onRemove={this.triggerRemoveAnnex} />
                      </li>
                    ))}

                    {isActiveUser &&
                      <li className="doc-card-list-button" key="add-annex">
                        <button
                          className="c-button -small -secondary"
                          type="button"
                          onClick={this.triggerAddAnnexModal}
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
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user
  })
)(DocCard));
