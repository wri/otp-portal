import React, { useCallback } from 'react';
import classnames from 'classnames';
import Icon from 'components/ui/icon';

import { useMap } from 'react-map-gl';

const ZoomControl = () => {
  const { current: map } = useMap();
  const minZoom = map.getMinZoom();
  const maxZoom = map.getMaxZoom();
  const zoom = map.getZoom();

  const increaseZoom = useCallback(() => {
    map.zoomIn();
  }, [map]);
  const decreaseZoom = useCallback(() => {
    map.zoomOut();
  }, [map]);

  const zoomInClass = classnames('zoom-control-btn', {
    '-disabled': zoom === maxZoom
  });

  const zoomOutClass = classnames('zoom-control-btn', {
    '-disabled': zoom === minZoom
  });

  return (
    <div className="c-zoom-control">
      <button className={zoomInClass} type="button" onClick={increaseZoom} aria-label="Zoom in">
        <Icon name="icon-plus" />
      </button>
      <button className={zoomOutClass} type="button" onClick={decreaseZoom} aria-label="Zoom out">
        <Icon name="icon-minus" />
      </button>
    </div>
  );
}

export default ZoomControl;
