import React from 'react';
import PropTypes from 'prop-types';

// Components
import Card from 'components/ui/card';

export default function Gallery3() {
  return (
    <div className="c-gallery">
      <h2>FAQs</h2>

      <div className="row custom-row">
        <div className="columns small-12 medium-4">
          <Card
            theme="-secondary"
            title="First FAQ"
            description="Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod."
            link={{
              label: 'Read more',
              href: '/help?tab=faqs',
              as: '/help/faqs'
            }}
          />
        </div>
        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            title="Second FAQ"
            description="Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod."
            link={{
              label: 'Find out more',
              href: '/help?tab=faqs',
              as: '/help/faqs'
            }}
          />
        </div>
        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            title="Third FAQ"
            description="Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod."
            link={{
              label: 'Read more',
              href: '/help?tab=faqs',
              as: '/help/faqs'
            }}
          />
        </div>
      </div>
    </div>
  );
}

Gallery3.propTypes = {};
