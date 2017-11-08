import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import DocNotRequiredModal from 'components/ui/doc-notrequired-modal';

class DocCard extends React.Component {
  static propTypes = {
    url: PropTypes.string,
    status: PropTypes.string,
    title: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    intl: intlShape.isRequired
  };

  static defaultProps = {

  };

  triggerWhy = (e) => {
    e && e.preventDefault();

    modal.toggleModal(true, {
      children: DocNotRequiredModal,
      childrenProps: this.props
    });
  }

  render() {
    const { startDate, endDate, status, title, url } = this.props;

    const metadata = HELPERS_DOC.getMetadata();

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    return (
      <div className={`c-doc-card ${classNames}`}>
        {!!url && status !== 'doc_not_provided' &&
          <a rel="noopener noreferrer" target="_blank" href={url}>
            <header className="doc-card-header">
              {startDate !== endDate &&
                <div className="doc-card-date">{endDate}</div>
              }
              <div className="doc-card-status">{metadata[status].label}</div>
            </header>
            <div className="doc-card-content">
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
            </div>
          </a>
        }

        {!url && status !== 'doc_not_provided' && status !== 'doc_not_required' &&
          <div>
            <header className="doc-card-header">
              {startDate !== endDate &&
                <div className="doc-card-date">{endDate}</div>
              }
              <div className="doc-card-status">{metadata[status].label}</div>
            </header>
            <div className="doc-card-content">
              <h3 className="doc-card-title c-title -big">
                {title}
              </h3>
            </div>
          </div>
        }
        {status === 'doc_not_provided' &&
          <div>
            <header className="doc-card-header">
              <div className="doc-card-status">{metadata[status].label}</div>
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
              <div className="doc-card-status">{metadata[status].label}</div>
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

export default injectIntl(DocCard);
