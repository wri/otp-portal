import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'react-fast-compare';

import { Popup } from 'react-map-gl';
import Icon from 'components/ui/icon';

// import LayerTemplate from './templates/layer';
import FmuTemplate from './templates/fmu';

class PopupComponent extends PureComponent {
  static propTypes = {
    popup: PropTypes.shape({}).isRequired,
    layers: PropTypes.array,
    onClose: PropTypes.func.isRequired
  };

  static defaultProps = {
    layers: []
  }

  componentDidUpdate(prevProps) {
    const { popup } = this.props;
    const { popup: prevPopup } = prevProps;

    if (!isEmpty(popup) && !isEqual(popup, prevPopup)) {
      window.removeEventListener('click', this.onClickOutside);
      window.addEventListener('click', this.onClickOutside);
    } else {
      window.removeEventListener('click', this.onClickOutside);
    }
  }

  onClose = (e) => {
    e && e.stopPropagation();
    const { onClose } = this.props;
    onClose();
  }

  onClickOutside = (e) => {
    if (!this.popup) return null;

    const { _containerRef } = this.popup;
    const { current } = _containerRef;

    if (!current.contains(e.target)) { this.onClose(); }
  }

  render() {
    const { popup, layers } = this.props;

    if (isEmpty(popup)) return null;

    return (
      <Popup
        {...popup}
        ref={(r) => { this.popup = r; }}
        closeButton={false}
        closeOnClick={false}
      >
        <div className="c-map-popup">
          <button key="close-button" className="map-popup--close mapbox-prevent-click" type="button" onClick={this.onClose}>
            <Icon name="icon-cross" className="-small mapbox-prevent-click" style={{ pointerEvents: 'none' }} />
          </button>

          <FmuTemplate
            activeInteractiveLayer={layers[0]}
            activeInteractiveLayers={layers}
          />
        </div>
      </Popup>
    );
  }
}

export default PopupComponent;
