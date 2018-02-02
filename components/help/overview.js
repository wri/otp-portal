import React from 'react';
import PropTypes from 'prop-types';

// Components
import Gallery1 from 'components/help/overview/gallery-1';
import Gallery2 from 'components/help/overview/gallery-2';
import Gallery3 from 'components/help/overview/gallery-3';

const HelpOverview = props => (
  <div
    className="c-section"
  >
    <div className="l-container">
      <Gallery1 />
      <Gallery2 />
      <Gallery3
        faqs={props.faqs}
      />
    </div>
  </div>
  );

HelpOverview.propTypes = {
  faqs: PropTypes.object
};

export default HelpOverview;
