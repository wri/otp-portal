import React from 'react';
import groupBy from 'lodash/groupBy';

// Constants
import { TABS_DOCUMENTATION_OPERATORS_DETAIL, DOCUMENTATION_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import StaticTabs from 'components/ui/static-tabs';
import DocumentsProvided from 'components/operators-detail/documentation/documents-provided';
import DocumentsGallery from 'components/operators-detail/documentation/documents-gallery';

export default class OperatorsDetailDocumentation extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tab: 'documents-list'
    };

    this.triggerChangeTab = this.triggerChangeTab.bind(this);
  }

  triggerChangeTab(tab) {
    this.setState({ tab });
  }

  render() {
    return (
      <div>
        <div className="c-section">
          <div className="l-container">
            <article className="c-article">
              <header>
                <h2 className="c-title">65% documents provided</h2>
              </header>

              <DocumentsProvided data={DOCUMENTATION_OPERATORS_DETAIL} />
            </article>
          </div>
        </div>

        <StaticTabs
          options={TABS_DOCUMENTATION_OPERATORS_DETAIL}
          defaultSelected={this.state.tab}
          onChange={this.triggerChangeTab}
        />

        <div className="c-section">
          <div className="l-container">
            {this.state.tab === 'documents-list' &&
              <DocumentsGallery data={DOCUMENTATION_OPERATORS_DETAIL} />
            }

            {this.state.tab === 'chronological-view' &&
              <h2 className="c-title">Chronological view</h2>
            }

          </div>
        </div>
      </div>
    );
  }
}

OperatorsDetailDocumentation.propTypes = {
};
