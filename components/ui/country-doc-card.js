import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
// import Tooltip from 'rc-tooltip';
import Tooltip from 'rc-tooltip/dist/rc-tooltip';

// Intl
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import DocInfoModal from 'components/ui/doc-info-modal';
import DocNotRequiredModal from 'components/ui/doc-notrequired-modal';
import DocAnnexesModal from 'components/ui/doc-annexes-modal';
import Icon from 'components/ui/icon';
import Spinner from 'components/ui/spinner';

class CountryDocCard extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    docType: PropTypes.string,
    status: PropTypes.string,
    title: PropTypes.string,
    explanation: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    properties: PropTypes.object,
    intl: intlShape.isRequired,
    onChange: PropTypes.func,
    units: PropTypes.string,
    value: PropTypes.number,
    link: PropTypes.string,
    govFiles: PropTypes.array
  };

  static defaultProps = {
    govFiles: []
  }

  constructor(props) {
    super(props);

    this.documentationService = new DocumentationService();
  }

  state = {
    deleteLoading: false
  }


  triggerWhy = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocNotRequiredModal,
      childrenProps: {
        ...this.props,
        onChange: () => {
          this.props.onChange && this.props.onChange();
        }
      }
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

  triggerRemoveGovFile = (id) => {
    const { user } = this.props;

    this.setState({ deleteLoading: true });

    this.documentationService.deleteGovFiles(id, user)
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
    const { user, startDate, endDate, status, title, explanation, docType, units, value, link, govFiles, properties } = this.props;
    const { id } = properties;
    const isActiveUser = (user && user.role === 'admin') ||
    (user && user.role === 'government' && user.country && user.country.toString() === id);

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    const { deleteLoading } = this.state;

    return (
      <div className={`c-doc-card ${classNames}`}>
        <div className="doc-card-info">
          <button
            className="c-button -clean -icon"
            onClick={() => {
              modal.toggleModal(true, {
                children: DocInfoModal,
                childrenProps: {
                  title,
                  explanation
                }
              });
            }}
          >
            <Icon
              name="icon-info"
              className="-smaller"
            />
          </button>
        </div>

        {status !== 'doc_not_provided' && status !== 'doc_not_required' &&
          <div>
            <header className="doc-card-header">
              {startDate !== endDate &&
                <div className="doc-card-date">{endDate}</div>
              }
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
            </header>
            <div className="doc-card-content">
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
            </div>

            {docType === 'stats' &&
              <div>
                {value} {units}
              </div>
            }

            {docType === 'link' &&
              <div>
                <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
              </div>
            }

            {docType === 'file' &&
              <ul className="doc-card-list">
                {govFiles.map(annex => (
                  <li className="doc-card-list-item" key={annex.id}>
                    <Tooltip
                      placement="bottom"
                      overlay={
                        <div>
                          <Spinner isLoading={deleteLoading} className="-tiny -transparent" />
                          {/* <h4 className="c-title -default tooltip-title">{annex.attachment.url}</h4> */}
                          {/* <dl className="tooltip-content">
                            <dt><strong>{this.props.intl.formatMessage({ id: 'annex.start_date' })}:</strong></dt>
                            <dd>{annex['start-date'] ? annex['start-date'] : '-' }</dd>
                            <dt><strong>{this.props.intl.formatMessage({ id: 'annex.expiry_date' })}:</strong></dt>
                            <dd>{annex['expire-date'] ? annex['expire-date'] : '-'}</dd>
                          </dl> */}
                          <div className="tooltip-footer">
                            {annex.attachment &&
                              <a href={annex.attachment.url} target="_blank" rel="noopener noreferrer" className="c-button -small -tooltip">{this.props.intl.formatMessage({ id: 'file' })}</a>
                            }
                            {isActiveUser &&
                              <button
                                className="c-button -small -tooltip -tooltip-secondary"
                                type="button"
                                onClick={() => this.triggerRemoveGovFile(annex.id)}
                              >
                                <span className="tooltip-hidden-button-text">{this.props.intl.formatMessage({ id: 'annex.remove' })}</span>
                                <Icon className="" name="icon-bin" />
                              </button>
                            }
                          </div>
                        </div>
                      }
                      overlayClassName="c-tooltip"
                    >
                      <button
                        className="c-button"
                        type="button"
                      >
                        <Icon className="" name="icon-file-empty" />
                      </button>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            }
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
          <div>
            <header className="doc-card-header">
              <div className="doc-card-status">{this.props.intl.formatMessage({ id: status })}</div>
              <div className="doc-card-why">
                <button onClick={this.triggerWhy} className="c-button -small -clean">
                  {this.props.intl.formatMessage({ id: 'why' })}
                </button>
              </div>
            </header>
            <div className="doc-card-content">
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
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
)(CountryDocCard));
