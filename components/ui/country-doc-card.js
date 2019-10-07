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
    url: PropTypes.string,
    status: PropTypes.string,
    title: PropTypes.string,
    explanation: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    properties: PropTypes.object,
    annexes: PropTypes.array,
    intl: intlShape.isRequired,
    onChange: PropTypes.func
  };

  static defaultProps = {
    annexes: []
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

  triggerRemoveAnnex = (id) => {
    const { user } = this.props;

    this.setState({ deleteLoading: true });

    this.documentationService.deleteAnnex(id, user)
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
    const { startDate, endDate, status, title, explanation, docType, units, value, link } = this.props;

    const classNames = classnames({
      [`-${status}`]: !!status
    });

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
