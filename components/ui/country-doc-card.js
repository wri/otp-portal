import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Intl
import { injectIntl } from 'react-intl';

// Services
import modal from 'services/modal';
import DocumentationService from 'services/documentationService';

// Components
import DocInfoModal from 'components/ui/doc-info-modal';
import Icon from 'components/ui/icon';

function formatStatUnit(unit) {
  if (unit === 'm3') return <>m<sup>3</sup></>;
  if (unit === 'm2') return <>m<sup>2</sup></>;
  if (unit === 'km2') return <>km<sup>2</sup></>;

  return unit;
}

function formatStatValue(value) {
  if (isNaN(value)) return value;

  return new Intl.NumberFormat().format(value);
}

class CountryDocCard extends React.Component {
  static propTypes = {
    docType: PropTypes.string,
    status: PropTypes.string,
    title: PropTypes.string,
    explanation: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    intl: PropTypes.object.isRequired,
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
      <div className={`c-doc-card ${classNames} country`}>
        {explanation && (
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
        )}

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
              <div className="doc-card-stats">
                <div>
                  {formatStatValue(value)} {formatStatUnit(units)}
                </div>
                <div className="doc-card-source">
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <span>{this.props.intl.formatMessage({ id: 'source' })}</span>
                    </a>
                  )}
                </div>
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
