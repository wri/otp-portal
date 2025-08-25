import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/ui/spinner';
import Html from 'components/html';
import { withRouter } from 'next/router';

// Intl
import { useIntl } from 'react-intl';

const HelpFaqs = ({ router, faqs }) => {
  const intl = useIntl();
  const moveToRef = useRef(null);

  useEffect(() => {
    const MoveTo = require('moveto'); //eslint-disable-line
    moveToRef.current = new MoveTo({
      tolerance: 50,
      duration: 500,
      easing: 'easeOutQuart'
    });

    if (router.query.article) {
      setTimeout(() => {
        triggerScrollTo(`#${router.query.article}`);
      }, 250);
    }
  }, []);

  useEffect(() => {
    if (router.query.article) {
      setTimeout(() => {
        triggerScrollTo(`#${router.query.article}`);
      }, 250);
    }
  }, [router.query.article]);

  const triggerScrollTo = (id) => {
    const target = document.querySelector(id);
    if (moveToRef.current && target) {
      moveToRef.current.move(target);
    }
  };

  const { data, loading, error } = faqs;

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
                {intl.formatMessage({ id: 'help.tabs.faqs' })}
              </h3>
              <nav>
                <ul>
                  {data.map(faq =>
                    <li
                      key={faq.id}
                      onClick={() => triggerScrollTo(`#faq-article-${faq.id}`)}
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
};

HelpFaqs.propTypes = {
  router: PropTypes.object.isRequired,
  faqs: PropTypes.object
};

export default withRouter(HelpFaqs);
