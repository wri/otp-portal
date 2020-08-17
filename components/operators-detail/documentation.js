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
import DocumentsCertification from 'components/operators-detail/documentation/documents-certification';
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
    const groupedByForestType = HELPERS_DOC.getGroupedByForestType(operatorDocumentation);

    return (
      <div>
        <div className="c-section">
          <div className="l-container">
            <DocumentsCertification
              id={url.query.id}
            />

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
          options={[
            {
              label: this.props.intl.formatMessage({ id: 'operator-documents' }),
              value: 'operator-documents'
            },
            ...Object.keys(groupedByForestType).map(t => (
              { label: `${this.props.intl.formatMessage({ id: `${(t || 'fmus')}-documents` })}`, value: t }
            ))
          ]}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        <div className="c-section">
          <div className="l-container">
            {this.state.tab === 'operator-documents' &&
              <DocumentsByOperator data={groupedByType['operator-document-countries']} id={url.query.id} />
            }

            {Object.keys(groupedByForestType).map((k) => {
              if (this.state.tab === k) {
                return (
                  <DocumentsByFMU
                    key={k}
                    group="fmu"
                    data={groupedByForestType[k]}
                    id={url.query.id}
                    query={url.query}
                  />
                );
              }

              return null;
            })}
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
