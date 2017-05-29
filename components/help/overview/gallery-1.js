import React from 'react';
import PropTypes from 'prop-types';

// Components
import Card from 'components/ui/card';

export default function Gallery1() {
  return (
    <div className="c-gallery">
      <h2 className="c-title">How the Open Timber Portal Works</h2>

      <div className="row custom-row">
        <div className="columns small-12 medium-4">
          <Card
            theme="-secondary"
            title="Understanding the platform"
            description="The Open Timber Platform aims to track the performance of forest concession operators."
            link={{
              label: 'Read more',
              href: '/help?tab=how-otp-works',
              as: '/help/how-otp-works'
            }}
          />
        </div>
        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            title="How the score is calculated"
            description="Registered forest operators are ranked according to their performance against standard legality and sustainability indicators."
            link={{
              label: 'Find out more',
              href: '/help?tab=how-otp-works',
              as: '/help/how-otp-works'
            }}
          />
        </div>
        <div className="columns small-12 medium-4">
          <Card
            theme="-primary"
            title="Understanding. Third card"
            description="Sociis natoque casius penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum id ligula porta felis euismod."
            link={{
              label: 'Read more',
              href: '/help?tab=how-otp-works',
              as: '/help/how-otp-works'
            }}
          />
        </div>
      </div>
    </div>
  );
}

Gallery1.propTypes = {};
