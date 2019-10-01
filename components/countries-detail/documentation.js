import React from 'react';
import PropTypes from 'prop-types';

import Router from 'next/router';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import StaticTabs from 'components/ui/static-tabs';
import DocumentsProvided from 'components/operators-detail/documentation/documents-provided';
import DocumentsByOperator from 'components/operators-detail/documentation/documents-by-operator';

class OperatorsDetailDocumentation extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tab: this.props.url.query.subtab || 'country-documents'
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  triggerChangeTab(tab) {
    const { id } = this.props.url.query;

    const location = {
      pathname: '/countries-detail',
      query: {
        id,
        tab: 'documentation',
        subtab: tab
      }
    };

    Router.replace(location, `/countries/${id}/documentation?subtab=${tab}`);
    this.setState({ tab });
  }

  render() {
    const { countriesDetail, countryDocumentation, url } = this.props;
    const groupedByType = HELPERS_DOC.getGroupedByType(countryDocumentation);

    return (
      <div>
        <div className="c-section">
          <div className="l-container">
            <article className="c-article">
              <header>
                <h2 className="c-title">
                  {this.props.intl.formatMessage({
                    id: 'operator-detail.documents.title'
                  }, {
                    percentage: HELPERS_DOC.getPercentage(countriesDetail.data)
                  })}
                </h2>
              </header>

              <div className="content">
                <DocumentsProvided data={countryDocumentation} />
              </div>
            </article>
          </div>
        </div>

        <StaticTabs
          options={[
            {
              label: 'Country documents',
              value: 'country-documents'
            }
          ]}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        <div className="c-section">
          <div className="l-container">
            {this.state.tab === 'country-documents' &&
              <DocumentsByOperator data={groupedByType['gov-documents']} id={url.query.id} />
            }
          </div>
        </div>
      </div>
    );
  }
}

OperatorsDetailDocumentation.propTypes = {
  countriesDetail: PropTypes.object,
  countryDocumentation: PropTypes.array,
  url: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsDetailDocumentation);
