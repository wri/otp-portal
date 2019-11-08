import React from 'react';
import PropTypes from 'prop-types';

// Components
import Gallery1 from 'components/help/overview/gallery-1';
import Gallery2 from 'components/help/overview/gallery-2';
import Gallery3 from 'components/help/overview/gallery-3';
import Gallery4 from 'components/help/overview/gallery-4';

const HelpOverview = props => (
  <div
    className="c-section"
  >
    <div className="l-container">
      <Gallery1
        howtos={props.howtos}
      />
      <Gallery2
        tools={props.tools}
      />
      <Gallery3
        faqs={props.faqs}
      />
      <Gallery4
        tutorials={props.tutorials}
      />
    </div>
  </div>
  );

HelpOverview.propTypes = {
  howtos: PropTypes.object,
  tools: PropTypes.object,
  faqs: PropTypes.object,
  tutorials: PropTypes.object
};

export default HelpOverview;
