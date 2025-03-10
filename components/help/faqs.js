import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/ui/spinner';
import Html from 'components/html';
import { withRouter } from 'next/router';

// Intl
import { injectIntl } from 'react-intl';

let MoveTo;

class HelpFaqs extends React.Component {

  componentDidMount() {
    MoveTo = require('moveto'); //eslint-disable-line

    this.moveTo = new MoveTo({
      tolerance: 50,
      duration: 500,
      easing: 'easeOutQuart'
    });

    if (this.props.router.query.article) {
      setTimeout(() => {
        this.triggerScrollTo(`#${this.props.router.query.article}`);
      }, 250);
    }
  }

  componentDidUpdate() {
    if (this.props.router.query.article) {
      setTimeout(() => {
        this.triggerScrollTo(`#${this.props.router.query.article}`);
      }, 250);
    }
  }

  triggerScrollTo(id) {
    const target = document.querySelector(id);
    this.moveTo.move(target);
  }

  render() {
    const { data, loading, error } = this.props.faqs;

    return (
      <div
        className="c-section"
      >
        <Spinner className="-transparent -small" isLoading={loading || error} />
        <div className="l-container">
          <div className="row l-row">
            <div className="columns small-12 medium-3">
              <aside className="c-aside -sticky">
                <h3>
                  {this.props.intl.formatMessage({ id: 'help.tabs.faqs' })}
                </h3>
                <nav>
                  <ul>
                    {data.map(faq =>
                      <li
                        key={faq.id}
                        onClick={() => this.triggerScrollTo(`#faq-article-${faq.id}`)}
                      >
                        {faq.question}
                      </li>
                    )}
                  </ul>
                </nav>
              </aside>
            </div>

            <div className="columns small-12 medium-8 medium-offset-1">
              {data.slice(0, 3).map(faq =>
                <article
                  key={faq.id}
                  id={`faq-article-${faq.id}`}
                  className="c-article"
                >
                  <header>
                    <h2 className="c-title">
                      {faq.question}
                    </h2>
                  </header>
                  <div className="content">
                    <div className="description">
                      <Html html={faq.answer} />
                    </div>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HelpFaqs.propTypes = {
  intl: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  faqs: PropTypes.object
};

export default injectIntl(withRouter(HelpFaqs));
