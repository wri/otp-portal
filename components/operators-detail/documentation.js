import React from 'react';

// Constants
import { TABS_DOCUMENTATION_OPERATORS_DETAIL, DOCUMENTATION_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
import StaticTabs from 'components/ui/static-tabs';
import DocCard from 'components/ui/doc-card';


export default class OperatorsDetailDocumentation extends React.Component {

  render() {
    return (
      <div>
        <div className="c-section">
          <div className="l-container">
            <article className="c-article">
              <div className="row custom-row">
                <div className="columns small-12 medium-8">
                  <header>
                    <h2 className="c-title">65% documents provided</h2>
                  </header>
                </div>
              </div>
            </article>
          </div>
        </div>

        <StaticTabs
          options={TABS_DOCUMENTATION_OPERATORS_DETAIL}
          defaultSelected="documents-list"
        />

        <div className="c-section">
          <div className="l-container">
            <ul className="c-doc-gallery">
              {Object.keys(DOCUMENTATION_OPERATORS_DETAIL).map(category => (
                <li
                  key={category}
                  className="doc-gallery-item"
                >
                  <header>
                    <h3 className="c-title -proximanova -extrabig -uppercase">{category}</h3>
                  </header>

                  <div className="row custom-row">
                    {DOCUMENTATION_OPERATORS_DETAIL[category].map(card => (
                      <div
                        key={card.id}
                        className="columns small-12 medium-4"
                      >
                        <DocCard
                          {...card}
                        />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

OperatorsDetailDocumentation.propTypes = {
};
