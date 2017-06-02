import React from 'react';

// Constants
import { DOCUMENTATION_OPERATORS_DETAIL } from 'constants/operators-detail';

// Components
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
        <div className="c-section">
          <div className="l-container">
            <ul className="c-doc-gallery">
              {Object.keys(DOCUMENTATION_OPERATORS_DETAIL).map(category => (
                <li className="doc-gallery-item">
                  <header>
                    <h3 className="c-title -proximanova -extrabig -uppercase">{category}</h3>
                  </header>

                  <div className="row custom-row">
                    {DOCUMENTATION_OPERATORS_DETAIL[category].map(card => (
                      <div className="columns small-12 medium-4">
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
