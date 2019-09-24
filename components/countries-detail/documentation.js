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
import DocumentsByFMU from 'components/operators-detail/documentation/documents-by-fmu';

class OperatorsDetailDocumentation extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tab: this.props.url.query.subtab || 'operator-documents'
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  triggerChangeTab(tab) {
    const { id } = this.props.url.query;

    const location = {
      pathname: '/operators-detail',
      query: {
        id,
        tab: 'documentation',
        subtab: tab
      }
    };

    Router.replace(location, `/operators/${id}/documentation?subtab=${tab}`);
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
              label: 'Operator documents',
              value: 'operator-documents'
            }
          ]}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        <div className="c-section">
          <div className="l-container">
            {this.state.tab === 'operator-documents' &&
              <DocumentsByOperator data={groupedByType['operator-document-countries']} id={url.query.id} />
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
