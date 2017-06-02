import React from 'react';

// Components
import Gallery1 from 'components/operators-detail/overview/gallery-1';

export default function OperatorsDetailOverview() {
  return (
    <div
      className="c-section"
    >
      <div className="l-container">
        <Gallery1 />
        <article className="c-article">
          <div className="row custom-row">
            <div className="columns small-12 medium-8">
              <header>
                <h2 className="c-title">Overview</h2>
              </header>
              <div className="description">
                <p>REM is a non-profit organisation that operates as Independent Monitor of Law Enforcement and Governance. Our mission is to stimulate government reform and action in natural resource extraction through independent monitoring and credible reporting of illegalities and related governance problems. We use this information to develop, with the concerned actors, constructive and viable solutions and assist in their implementation.</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
