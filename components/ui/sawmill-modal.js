import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import {
  setMapLocation,
  unmountMap
} from 'modules/sawmill-map';

import { injectIntl } from 'react-intl';

import modal from 'services/modal';
import SawmillsService from 'services/sawmillsService';

import Form, { FormProvider } from 'components/form/Form';
import Field from 'components/form/Field';
import Input from 'components/form/Input';
import Checkbox from 'components/form/Checkbox';
import SubmitButton from 'components/form/SubmitButton';
import Spinner from 'components/ui/spinner';
import Map from 'components/map';
import LayerManager from 'components/map/layer-manager';
import MapControls from 'components/map/map-controls';
import ZoomControl from 'components/map/controls/zoom-control';
import LocationSearch from 'components/map/location-search';

import CancelButton from '../form/CancelButton';

class SawmillModal extends React.Component {
  static propTypes = {
    user: PropTypes.object,
    language: PropTypes.string,
    sawmill: PropTypes.object,
    intl: PropTypes.object.isRequired,
    sawmillMap: PropTypes.object,
    onChange: PropTypes.func,
    setMapLocation: PropTypes.func,
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
      lat: 0,
      lng: 0,
      'is-active': false
    };

    const formState = sawmill || emptyFormState;

    this.state = {
      initialFormState: {
        ...formState
      },
      hasMapLayer: false
    };
  }

  componentDidMount() {
    const { sawmill, sawmillMap } = this.props;
    if (sawmill) {
      const { viewport } = sawmillMap;

      this.props.setMapLocation({
        ...viewport,
        latitude: sawmill.lat,
        longitude: sawmill.lng
      });
    }
  }

  componentWillUnmount() {
    this.props.unmountMap();
  }

  // HELPERS
  getBody(form) {
    const { sawmill } = this.props;
    return {
      data: {
        ...(!!sawmill && !!sawmill.id && { id: sawmill.id }),
        type: 'sawmills',
        attributes: {
          name: form.name,
          lat: form.lat,
          lng: form.lng,
          'is-active': form['is-active']
        }
      }
    };
  }

  // UI EVENTS
  handleSubmit = ({ form }) => {
    const { sawmill, onChange } = this.props;

    return this.sawmillsService.saveSawmill({
      id: sawmill && sawmill.id,
      body: this.getBody(form)
    }).then(() => {
      onChange && onChange();
      modal.toggleModal(false);
    });
  }

  handleChange = (value, formContext) => {
    const { sawmillMap } = this.props;
    const { viewport } = sawmillMap;
    const { form, setFormValues } = formContext;

    setFormValues(value);

    this.props.setMapLocation({
      ...viewport,
      latitude: form.lat,
      longitude: form.lng
    });
  }

  setMapLocation = (location, setFormValues) => {
    const { sawmillMap } = this.props;
    const { viewport } = sawmillMap;

    this.props.setMapLocation({
      ...viewport,
      ...location
    });

    setFormValues({
      lat: viewport.latitude,
      lng: viewport.longitude
    });
  }

  render() {
    const {
      intl,
      sawmill,
      sawmillMap
    } = this.props;

    return (
      <div className="c-login">
        <h2 className="c-title -extrabig">
          {
            sawmill ? intl.formatMessage({ id: 'sawmills.modal.title.edit' }) :
              intl.formatMessage({ id: 'sawmills.modal.title' })
          }
        </h2>
        <FormProvider initialValues={this.state.initialFormState} onSubmit={this.handleSubmit}>
          {({ form, setFormValues }) => (
            <Form>
              <fieldset className="c-field-container" name="add-sawmill">
                <div className="c-field-row">
                  <div className="l-row row -equal-heigth">
                    <div className="columns medium-8 small-12">
                      <Field
                        className="-fluid"
                        validations={['required']}
                        properties={{
                          name: 'name',
                          label: intl.formatMessage({ id: 'sawmills.modal.name' }),
                          required: true,
                          type: 'text',
                          'data-test-id': 'sawmill-name'
                        }}
                      >
                        {Input}
                      </Field>
                    </div>
                    <div className="columns medium-4 small-12">
                      <Field
                        className="-fluid"
                        properties={{
                          name: 'is-active',
                          label: intl.formatMessage({ id: 'sawmills.modal.active' }),
                          'data-test-id': 'sawmill-isactive'
                        }}
                      >
                        {Checkbox}
                      </Field>
                    </div>
                  </div>
                </div>

                <div className={'c-map-container -modal'}>
                  <Spinner isLoading={sawmillMap.loading} className="-light" />

                  {process.env.GOOGLE_API_KEY && (
                    <LocationSearch setMapLocation={this.props.setMapLocation} />
                  )}

                  {/* Map */}
                  <Map
                    language={this.props.language}

                    // viewport
                    viewport={sawmillMap.viewport}
                    onViewportChange={(location) => this.setMapLocation(location, setFormValues)}

                    onClick={this.onClick}
                  >
                    {map => (
                      <Fragment>
                        <MapControls>
                          <ZoomControl />
                        </MapControls>

                        {/* LAYER MANAGER */}
                        <LayerManager
                          map={map}
                          layers={[
                            {
                              id: 'observation',
                              type: 'geojson',
                              source: {
                                type: 'geojson',
                                data: {
                                  type: 'FeatureCollection',
                                  features: [
                                    {
                                      type: 'Feature',
                                      geometry: {
                                        type: 'Point',
                                        coordinates: [sawmillMap.viewport.longitude, sawmillMap.viewport.latitude]
                                      }
                                    }
                                  ]
                                }
                              },
                              render: {
                                layers: [{
                                  type: 'circle',
                                  paint: {
                                    'circle-color': '#e98300',
                                    'circle-radius': 10
                                  }
                                }]
                              }
                            }
                          ]}
                        />
                      </Fragment>
                    )}
                  </Map>


                </div>

                <div className="c-field-row">
                  <div className="l-row row -equal-heigth">
                    <div className="columns medium-6 small-12">
                      <Field
                        onChange={value => this.handleChange({ lat: +value }, { form, setFormValues })}
                        className="-fluid"
                        properties={{
                          name: 'lat',
                          label: intl.formatMessage({ id: 'sawmills.modal.lat' }),
                          type: 'number',
                          default: form.lat.toFixed(2),
                          value: form.lat.toFixed(2),
                          'data-test-id': 'sawmill-latitude'
                        }}
                      >
                        {Input}
                      </Field>
                    </div>
                    <div className="columns medium-6 small-12">
                      <Field
                        onChange={value => this.handleChange({ lng: +value }, { form, setFormValues })}
                        className="-fluid"
                        properties={{
                          name: 'lng',
                          label: intl.formatMessage({ id: 'sawmills.modal.lng' }),
                          type: 'number',
                          default: form.lng.toFixed(2),
                          value: form.lng.toFixed(2),
                          'data-test-id': 'sawmill-longitude'
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
                  <CancelButton onClick={() => modal.toggleModal(false)} />
                </li>
                <li>
                  <SubmitButton>
                    {intl.formatMessage({ id: 'submit' })}
                  </SubmitButton>
                </li>
              </ul>
            </Form>
          )}
        </FormProvider>
      </div>
    );
  }
}

export default injectIntl(connect(
  state => ({
    user: state.user,
    language: state.language,
    operatorsDetailFmus: state.operatorsDetailFmus,
    sawmillMap: state.sawmillMap
  }), {
  setMapLocation,
  unmountMap
}
)(SawmillModal));
