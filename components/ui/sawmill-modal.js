import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Redux
import { connect } from 'react-redux';
import {
  setMarkerLocation,
  setMarkerMode,
  getSawMillLocationById,
  setMapLocation,
  unmountMap
} from 'modules/sawmill-map';

// Intl
import { injectIntl, intlShape } from 'react-intl';

// Services
import modal from 'services/modal';
import SawmillsService from 'services/sawmillsService';

// Components
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Checkbox from 'components/form/Checkbox';
import Spinner from 'components/ui/spinner';
import Map from 'components/map/map';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import PickerControl from 'components/map/controls/picker-control';
import LocationSearch from 'components/map/location-search';

// Constants
const FORM_ELEMENTS = {
  elements: {
  },
  validate() {
    const elements = this.elements;
    Object.keys(elements).forEach((k) => {
      elements[k].validate();
    });
  },
  isValid() {
    const elements = this.elements;
    const valid = Object.keys(elements)
      .map(k => elements[k].isValid())
      .filter(v => v !== null)
      .every(element => element);

    return valid;
  }
};

class SawmillModal extends React.Component {
  static propTypes = {
    markerMode: PropTypes.bool,
    user: PropTypes.object,
    sawmill: PropTypes.object,
    intl: intlShape.isRequired,
    sawmillMap: PropTypes.object,
    lngLat: PropTypes.object,
    onChange: PropTypes.func,
    setMapLocation: PropTypes.func,
    setMarkerLocation: PropTypes.func,
    setMarkerMode: PropTypes.func,
    unmountMap: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.sawmillsService = new SawmillsService({
      authorization: props.user.token
    });

    const { sawmill } = this.props;
    const emptyFormState = {
      name: '',
      lat: '',
      lng: '',
      'is-active': false
    };

    const formState = sawmill || emptyFormState;

    this.state = {
      form: {
        ...formState
      },
      submitting: false,
      errors: [],
      hasMapLayer: false
    };
  }

  componentDidMount() {
    const { sawmill } = this.props;

    if (sawmill) {
      this.props.setMapLocation({
        center: {
          lat: sawmill.lat, lng: sawmill.lng
        }
      });
      this.props.setMarkerLocation({ lat: sawmill.lat, lng: sawmill.lng });
    }
  }

  componentWillUnmount() {
    this.props.unmountMap();
  }

  // HELPERS
  getBody() {
    const { sawmill, lngLat } = this.props;
    return {
      data: {
        ...!!sawmill && !!sawmill.id && { id: sawmill.id },
        type: 'sawmills',
        attributes: {
          name: this.state.form.name,
          lat: lngLat.lat,
          lng: lngLat.lng,
          'is-active': this.state.form['is-active']
        }
      }
    };
  }

  getMarkerLayers(lng, lat, sawmill) {
    const { lngLat } = this.props;
    if (!lngLat) return [];

    return [
      {
        id: `sawmill-${lngLat.lat}-${lngLat.lng}`,
        provider: 'geojson',
        source: {
          type: 'geojson',
          data: {
            ...!sawmill && {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [lngLat.lng, lngLat.lat]
                  }
                }
              ]
            }
          }
        },
        layers: [{
          id: 'sawmill',
          source: `sawmill-${lngLat.lat}-${lngLat.lng}`,
          name: 'Sawmill',
          type: 'circle',
          paint: {
            'circle-color': '#e98300',
            'circle-radius': 10
          }
        }]
      }
    ];
  }

  // UI EVENTS
  handleSubmit(e) {
    e.preventDefault();
    const { sawmill } = this.props;

    // Validate the form
    FORM_ELEMENTS.validate();

    // Set a timeout due to the setState function of react
    setTimeout(() => {
      // Validate all the inputs on the current step
      const valid = FORM_ELEMENTS.isValid(this.state.form);

      if (valid) {
        // Start the submitting
        this.setState({ submitting: true });

        this.sawmillsService.saveSawmill({
          type: (sawmill && sawmill.id) ? 'PATCH' : 'POST',
          id: sawmill && sawmill.id,
          body: this.getBody()
        })
          .then(() => {
            this.setState({ submitting: false, errors: [] });
            this.props.onChange && this.props.onChange();
            modal.toggleModal(false);
          })
          .catch((err) => {
            console.error(err);
            this.setState({ submitting: false, errors: err });
          });
      }
    }, 0);
  }

  handleChange(value) {
    const form = Object.assign({}, this.state.form, value);
    this.setState({ form });
  }

  handleMapClick = (map, event) => {
    const { markerMode } = this.props;
    const { lng, lat } = event.lngLat;
    if (!markerMode) return;

    this.props.setMapLocation({
      center: {
        lat, lng
      }
    });

    this.props.setMarkerLocation({ lat, lng });
  }

  handleMarkerLocationChange({ lat, lng }) {
    const { lngLat } = this.props;

    this.props.setMapLocation({
      center: {
        lat: lat || lngLat.lat,
        lng: lng || lngLat.lng
      }
    });

    this.props.setMarkerLocation({
      lat: lat || lngLat.lat,
      lng: lng || lngLat.lng
    });
  }

  render() {
    const { submitting } = this.state;
    const {
      markerMode,
      sawmill,
      sawmillMap
    } = this.props;

    const submittingClassName = classnames({
      '-submitting': submitting
    });

    const mapContainerClassName = classnames({
      '-picker': markerMode
    });

    return (
      <div className="c-login">
        <Spinner isLoading={submitting} className="-light" />
        <h2 className="c-title -extrabig">
          {
          sawmill ? this.props.intl.formatMessage({ id: 'sawmills.modal.title.edit' }) :
            this.props.intl.formatMessage({ id: 'sawmills.modal.title' })
          }
        </h2>
        <form className="c-form" onSubmit={e => this.handleSubmit(e)} noValidate>
          <fieldset className="c-field-container" name="add-sawmill">
            <div className="c-field-row">
              <div className="l-row row -equal-heigth">
                <div className="columns medium-8 small-12">
                  <Field
                    onChange={value => this.handleChange({ name: value })}
                    className="-fluid"
                    validations={['required']}
                    properties={{
                      name: 'name',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.name' }),
                      required: true,
                      type: 'text',
                      default: this.state.form.name
                    }}
                  >
                    {Input}
                  </Field>
                </div>
                <div className="columns medium-4 small-12">
                  <Field
                    onChange={value => this.handleChange({ 'is-active': value.checked })}
                    className="-fluid"
                    properties={{
                      name: 'is-active',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.active' }),
                      checked: this.state.form['is-active']
                    }}
                  >
                    {Checkbox}
                  </Field>
                </div>
              </div>
            </div>

            <div className={`c-map-container -modal ${mapContainerClassName}`}>
              <Spinner isLoading={sawmillMap.loading} className="-light" />
              <LocationSearch
                setMapLocation={this.props.setMapLocation}
                setMarkerLocation={this.props.setMarkerLocation}
              />
              <Map
                ref={(map) => { this.mapContainer = map; }}
                mapOptions={sawmillMap.mapOptions}
                mapListeners={{
                  click: (map, event) => {
                    this.handleMapClick(map, event);
                  }
                }}
                layers={this.getMarkerLayers()}
              />
              <MapControls>
                <ZoomControl
                  zoom={sawmillMap.mapOptions.zoom}
                  onZoomChange={(zoom) => {
                    this.props.setMapLocation({
                      zoom
                    });
                  }}
                />
                <PickerControl
                  pickerMode={markerMode}
                  setMarkerMode={this.props.setMarkerMode}
                />
              </MapControls>
            </div>

            <div className="c-field-row">
              <div className="l-row row -equal-heigth">
                <div className="columns medium-6 small-12">
                  {/* DATE */}
                  <Field
                    onChange={value => this.handleMarkerLocationChange({ lat: value })}
                    className="-fluid"
                    properties={{
                      name: 'lat',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.lat' }),
                      type: 'number',
                      default: this.state.form.lat,
                      value: this.props.lngLat.lat
                    }}
                  >
                    {Input}
                  </Field>
                </div>
                <div className="columns medium-6 small-12">
                  {/* DATE */}
                  <Field
                    onChange={value => this.handleMarkerLocationChange({ lng: value })}
                    className="-fluid"
                    properties={{
                      name: 'lng',
                      label: this.props.intl.formatMessage({ id: 'sawmills.modal.lng' }),
                      type: 'number',
                      default: this.state.form.lng,
                      value: this.props.lngLat.lng
                    }}
                  >
                    {Input}
                  </Field>
                </div>
              </div>
            </div>
          </fieldset>

          <ul className="c-field-buttons">
            <li>
              <button
                type="button"
                name="commit"
                className="c-button -primary -expanded"
                onClick={() => modal.toggleModal(false)}
              >
                {this.props.intl.formatMessage({ id: 'cancel' })}
              </button>
            </li>
            <li>
              <button
                type="submit"
                name="commit"
                disabled={submitting}
                className={`c-button -secondary -expanded ${submittingClassName}`}
              >
                {this.props.intl.formatMessage({ id: 'submit' })}
              </button>
            </li>
          </ul>
        </form>
      </div>
    );
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user,
    operatorsDetailFmus: state.operatorsDetailFmus,
    sawmillMap: state.sawmillMap,
    markerMode: state.sawmillMap.markerMode,
    lngLat: state.sawmillMap.lngLat
  }), {
    setMapLocation,
    setMarkerLocation,
    setMarkerMode,
    getSawMillLocationById,
    unmountMap
  }
)(SawmillModal));
