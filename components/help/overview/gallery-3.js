import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

// Components
import Spinner from 'components/ui/spinner';

// Components
import Card from 'components/ui/card';

function Gallery3(props) {
  const { data, loading, error } = props.faqs;

  return (
    <div className="c-gallery">
      <h2 className="c-title">
        {props.intl.formatMessage({ id: 'help.tabs.faqs' })}
      </h2>
      <div className="gallery-content">
        <div className="row l-row">
          <Spinner className="-transparent -small" isLoading={loading || error} />
          {data.map(faq => (
            <div
              key={faq.id}
              className="columns small-12 medium-6"
            >
              <Card
                theme="-primary"
                title={faq.question}
                description={faq.answer}
                link={{
                  label: props.intl.formatMessage({ id: 'Read more' }),
                  href: `/help/faqs?article=faq-article-${faq.id}`
                }}
              />
            </div>
          ))}
        </div>
        {data.length === 0 &&
          <p>
            {props.intl.formatMessage({ id: 'help.tabs.faqs.overview.no_faqs' }) }
          </p>
        }
      </div>
    </div>
  );
}

Gallery3.propTypes = {
  intl: PropTypes.object.isRequired,
  faqs: PropTypes.object
};

export default injectIntl(Gallery3);
