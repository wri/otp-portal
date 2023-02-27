import React from 'react';
import PropTypes from 'prop-types';

import Html from 'components/html';

const LayerInfo = ({ metadata }) => {
  return (
    <div className="c-layer-info">
      <h2 className="c-layer-info__title">
        {metadata.title} {metadata.dateOfContent && `(${metadata.dateOfContent})`}
      </h2>
      <p className="c-layer-info__subtitle">{metadata.subtitle}</p>
      <div className="c-layer-info__overview">
        <h3>Overview</h3>
        <Html html={metadata.overview} linkify />
      </div>

      <div className="c-layer-info__source">
        <h3>Source</h3>
        <Html html={metadata.source} linkify />
      </div>
    </div>
  )
}

LayerInfo.propTypes = {
  metadata: PropTypes.object.isRequired
}

export default LayerInfo;
