import React from 'react';
import PropTypes from 'prop-types';
import MoveTo from 'moveto';
import { StickyContainer, Sticky } from 'react-sticky';

// Intl
import { injectIntl, intlShape } from 'react-intl';

import { LEGISLATION_AND_REGULATIONS_HELP } from 'constants/help';

class HelpLegislationAndRegulations extends React.Component {
  constructor(props) {
    super(props);

    this.moveTo = new MoveTo({
      tolerance: 50,
      duration: 500,
      easing: 'easeOutQuart'
    });
  }

  componentDidMount() {
    if (this.props.url.query.article) {
      this.triggerScrollTo(`#${this.props.url.query.article}`);
    }
  }

  triggerScrollTo(id) {
    const target = document.querySelector(id);
    this.moveTo.move(target);
  }

  render() {
    return (
      <div
        className="c-section"
      >
        <div className="l-container">
          <StickyContainer>
            <div className="row l-row">
              <div className="columns small-12 medium-3">
                <Sticky>
                  {
                    ({ style }) => (
                      <aside className="c-aside" style={style}>
                        <h3>
                          {this.props.intl.formatMessage({ id: 'help.tabs.legislation' })}
                        </h3>
                        <nav>
                          <ul>
                            {LEGISLATION_AND_REGULATIONS_HELP.map(article =>
                              <li
                                key={article.id}
                                onClick={() => this.triggerScrollTo(`#${article.id}`)}
                              >
                                {this.props.intl.formatMessage({ id: article.title })}
                              </li>
                            )}
                          </ul>
                        </nav>
                      </aside>
                    )
                  }
                </Sticky>
              </div>

              <div className="columns small-12 medium-8 medium-offset-1">
                {LEGISLATION_AND_REGULATIONS_HELP.map(article =>
                  <article
                    key={article.id}
                    id={article.id}
                    className="c-article"
                  >
                    <header>
                      <h2 className="c-title">
                        {this.props.intl.formatMessage({ id: article.title })}
                      </h2>
                    </header>
                    <div className="content">
                      <div className="description">
                        <p>
                          {this.props.intl.formatMessage({ id: article.description })}
                        </p>
                        <p><a href={article.site} target="_blank" rel="noopener noreferrer">Go to site</a></p>
                        <img src="/static/images/static-header/bg-help.jpg" alt={this.props.intl.formatMessage({ id: article.title })} />
                      </div>
                    </div>
                  </article>
                )}
              </div>
            </div>
          </StickyContainer>
        </div>
      </div>
    );
  }
}

HelpLegislationAndRegulations.propTypes = {
  intl: intlShape.isRequired,
  url: PropTypes.object.isRequired
};

export default injectIntl(HelpLegislationAndRegulations);
