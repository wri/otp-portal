import React from 'react';

// Components
import Gallery1 from 'components/help/overview/gallery-1';
import Gallery2 from 'components/help/overview/gallery-2';
import Gallery3 from 'components/help/overview/gallery-3';

export default function HelpOverview() {
  return (
    <div
      className="c-help-section"
    >
      <div className="l-container">
        <Gallery1 />
        <Gallery2 />
        <Gallery3 />
      </div>
    </div>
  );
}
