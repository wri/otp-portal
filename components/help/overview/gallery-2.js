import React from 'react';

// Components
import Card from 'components/ui/card';

export default function Gallery2() {
  return (
    <div className="c-gallery">
      <h2>Legislation and Regulations </h2>

      <div className="row custom-row">
        <div className="columns small-12 medium-4">
          <Card
            theme="-secondary"
            title="Understanding Forest Products and Legality"
            description="The Risk Information Tool provides an overview of relevant legislations and regulations, information about most commonly traded species, etc."
            link={{
              label: 'Learn more',
              href: '/help?tab=legislation-and-regulations',
              as: '/help/legislation-and-regulations'
            }}
          />
        </div>
        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            title="Understand Timber Trade and Due Dilligence"
            description="The Timber Trade Portal provides information regarding legal timber trade, due diligence and on country requirements and exports."
            link={{
              label: 'Learn more',
              href: '/help?tab=legislation-and-regulations',
              as: '/help/legislation-and-regulations'
            }}
          />
        </div>
        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            title="Understanding the Voluntary Partnership Agreement (VPA) Process"
            description="Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod."
            link={{
              label: 'Read more',
              href: '/help?tab=legislation-and-regulations',
              as: '/help/legislation-and-regulations'
            }}
          />
        </div>
      </div>
    </div>
  );
}
