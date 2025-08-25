import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'components/ui/spinner';
import Html from 'components/html';
import { withRouter } from 'next/router';

// Intl
import { useIntl } from 'react-intl';

// Hooks
import useMoveTo from 'hooks/use-move-to';

const HelpTools = ({ router, tools }) => {
  const intl = useIntl();
  const triggerScrollTo = useMoveTo(router.query.article);

  const { data, loading, error } = tools;

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
                {intl.formatMessage({ id: 'help.tabs.legislation' })}
              </h3>
              <nav>
                <ul>
                  {data.map(tutorial =>
                    <li
                      key={tutorial.id}
                      onClick={() => triggerScrollTo(`#tutorial-article-${tutorial.id}`)}
                    >
                      {tutorial.name}
                    </li>
                  )}
                </ul>
              </nav>
            </aside>
          </div>

          <div className="columns small-12 medium-8 medium-offset-1">
            {data.map(tutorial =>
              <article
                key={tutorial.id}
                id={`tutorial-article-${tutorial.id}`}
                className="c-article"
              >
                <header>
                  <h2 className="c-title">
                    {tutorial.name}
                  </h2>
                </header>
                <div className="content">
                  <div className="description">
                    <Html html={tutorial.description} />
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

HelpTools.propTypes = {
  router: PropTypes.object.isRequired,
  tools: PropTypes.object
};

export default withRouter(HelpTools);
