import React from 'react';
import PropTypes from 'prop-types';

import Router from 'next/router';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Constants
import { TABS_DOCUMENTATION_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import StaticTabs from 'components/ui/static-tabs';
import DocumentsProvided from 'components/operators-detail/documentation/documents-provided';
import DocumentsByOperator from 'components/operators-detail/documentation/documents-by-operator';
import DocumentsByFMU from 'components/operators-detail/documentation/documents-by-fmu';
import DocumentsStackedTimeline from 'components/operators-detail/documentation/documents-by-stacked-timeline';

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
    const { operatorsDetail, operatorDocumentation, url } = this.props;
    const groupedByType = HELPERS_DOC.getGroupedByType(operatorDocumentation);

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
                    percentage: HELPERS_DOC.getPercentage(operatorsDetail.data)
                  })}
                </h2>
              </header>

              <div className="content">
                <DocumentsProvided data={operatorDocumentation} />
              </div>
            </article>
          </div>
        </div>

        <StaticTabs
          options={TABS_DOCUMENTATION_OPERATORS_DETAIL.map(t => (
            { ...t, label: this.props.intl.formatMessage({ id: t.value }) }
          ))}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        <div className="c-section">
          <div className="l-container">
            {this.state.tab === 'operator-documents' &&
              <DocumentsByOperator data={groupedByType['operator-document-countries']} id={url.query.id} />
            }

            {this.state.tab === 'fmus-documents' &&
              <DocumentsByFMU
                group="fmu" data={groupedByType['operator-document-fmus']}
                id={url.query.id}
                query={url.query}
              />
            }

            {this.state.tab === 'chronological-view' && groupedByType['operator-document-countries'] &&
              <DocumentsStackedTimeline data={groupedByType['operator-document-countries']} id={url.query.id} />
            }

          </div>
        </div>
      </div>
    );
  }
}

OperatorsDetailDocumentation.propTypes = {
  operatorsDetail: PropTypes.object,
  operatorDocumentation: PropTypes.array,
  url: PropTypes.object,
  intl: intlShape.isRequired
};

export default injectIntl(OperatorsDetailDocumentation);
