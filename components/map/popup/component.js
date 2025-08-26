import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { isEmpty } from 'utils/general';

import { Popup } from 'react-map-gl';
import Icon from 'components/ui/icon';

// import LayerTemplate from './templates/layer';
import FmuTemplate from './templates/fmu';
import FmuTemplateAAC from './templates/fmu-aac';
import ObservationTemplate from './templates/observation';

const TEMPLATES = {
  fmus: FmuTemplate,
  'fmus-detail': FmuTemplateAAC,
  observation: ObservationTemplate
};

class PopupComponent extends PureComponent {
  static propTypes = {
    popup: PropTypes.shape({}).isRequired,
    template: PropTypes.string.isRequired,
    templateProps: PropTypes.shape({}),
    onClose: PropTypes.func
  };

  componentDidMount() {
    window.addEventListener('click', this.onClickOutside);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onClickOutside);
  }

  onClose = (e) => {
    e && e.stopPropagation();
    const { onClose } = this.props;

    !!onClose && onClose();
  }

  onClickOutside = (e) => {
    if (!this.popup) return null;

    const clickedElement = e.target;
    const popupContainer = this.popup._container;

    if (!clickedElement.classList.contains('mapboxgl-canvas') && !popupContainer.contains(clickedElement)) { this.onClose(); }
  }

  render() {
    const { popup, template, templateProps, onClose } = this.props;

    if (isEmpty(popup)) return null;

    return (
      <Popup
        {...popup}
        maxWidth={null}
        ref={(r) => { this.popup = r; }}
        closeButton={false}
        closeOnClick={false}
      >
        <div className="c-map-popup">
          {!!onClose &&
            <button key="close-button" className="map-popup--close mapbox-prevent-click" type="button" onClick={this.onClose}>
              <Icon name="icon-cross" className="-small mapbox-prevent-click" style={{ pointerEvents: 'none' }} />
            </button>
          }

          {!!TEMPLATES[template] &&
            React.createElement(TEMPLATES[template], {
              ...templateProps
            })
          }
        </div>
      </Popup>
    );
  }
}

export default PopupComponent;
