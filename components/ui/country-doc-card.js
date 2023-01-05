import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import DocInfoModal from 'components/ui/doc-info-modal';
import Icon from 'components/ui/icon';

class CountryDocCard extends React.Component {
  static propTypes = {
    docType: PropTypes.string,
    status: PropTypes.string,
    title: PropTypes.string,
    explanation: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    intl: intlShape.isRequired,
    units: PropTypes.string,
    value: PropTypes.number,
    url: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.documentationService = new DocumentationService();
  }

  render() {
    const { startDate, endDate, status, title, explanation, docType, units, value, url, intl } = this.props;

    const classNames = classnames({
      [`-${status}`]: !!status
    });

    let statusText = intl.formatMessage({ id: status });
    if (status === 'doc_valid') {
      statusText = intl.formatMessage({ id: 'gov_doc_valid', defaultMessage: 'Published' });
    } else if (status === 'doc_pending') {
      statusText = intl.formatMessage({ id: 'gov_doc_pending', defaultMessage: 'Pending' });
    }

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

        {status !== 'doc_not_provided' &&
          <div>
            <header className="doc-card-header">
              {endDate && startDate !== endDate &&
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
              <div className="doc-card-status">{statusText}</div>
            </header>
            <div className="doc-card-content">
              {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <h3 className="doc-card-title c-title -big">
                    {title}
                  </h3>
                </a>
              ) : (
                <h3 className="doc-card-title c-title -big">
                  {title}
                </h3>
              )}
            </div>

            {docType === 'stats' &&
              <div>
                {value} {units}
              </div>
            }
          </div>
        }

        {status === 'doc_not_provided' &&
          <div>
            <header className="doc-card-header">
              <div className="doc-card-status">{statusText}</div>
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

export default injectIntl(CountryDocCard);
