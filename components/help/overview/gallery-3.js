import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl, intlShape } from 'react-intl';

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
          {data.map((faq, i) => {
            let theme = (i % 3 === 0) ? '-secondary' : '-primary';
            theme += `${i >= 3 ? ' -trailing' : ''}`;
            return (
              <div
                key={faq.id}
                className="columns small-12 medium-6"
              >
                <Card
                  theme={theme}
                  title={faq.question}
                  description={faq.answer}
                  link={{
                    label: props.intl.formatMessage({ id: 'help.tabs.faqs.overview.link.label' }),
                    href: `/help/faqs?article=faq-article-${faq.id}`
                  }}
                />
              </div>
            );
          })}
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
  intl: intlShape.isRequired,
  faqs: PropTypes.object
};

export default injectIntl(Gallery3);
