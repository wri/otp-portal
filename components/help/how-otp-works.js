import React from 'react';
import MoveTo from 'moveto';
import { StickyContainer, Sticky } from 'react-sticky';

import { HOW_OTP_WORKS_HELP } from 'constants/help';

export default class HelpHowOTPWorks extends React.Component {

  constructor(props) {
    super(props);

    this.moveTo = new MoveTo({
      tolerance: 50,
      duration: 500,
      easing: 'easeOutQuart'
    });
  }

  triggerScrollTo(id) {
    const target = document.querySelector(id);
    this.moveTo.move(target);
  }

  render() {
    return (
      <div
        className="c-help-section"
      >
        <div className="l-container">
          <StickyContainer>
            <div className="row custom-row">
              <div className="columns small-12 medium-3">
                <Sticky>
                  {
                    ({ style }) => (
                      <aside className="c-aside" style={style}>
                        <h3>How OTP Works</h3>
                        <nav>
                          <ul>
                            {HOW_OTP_WORKS_HELP.map(article =>
                              <li
                                key={article.id}
                                onClick={() => this.triggerScrollTo(`#${article.id}`)}
                              >
                                {article.title}
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
                {HOW_OTP_WORKS_HELP.map(article =>
                  <article
                    key={article.id}
                    id={article.id}
                    className="c-article"
                  >
                    <header>
                      <h2 className="c-title">{article.title}</h2>
                    </header>
                    <div className="description">
                      {article.description}
                      <img src="/static/images/static-header/bg-help.jpg" alt={article.title} />
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

HelpHowOTPWorks.propTypes = {
};
