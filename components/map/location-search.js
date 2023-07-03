import React from 'react';
import Geosuggest from 'react-geosuggest';
import PropTypes from 'prop-types';

class LocationSearch extends React.Component {
  static propTypes = {
    setMapLocation: PropTypes.func,
    setMarkerLocation: PropTypes.func
  };

  onSuggestSelect = (e) => {
    if (!e) return;

    const { lat, lng } = e.location;
    this.props.setMapLocation({
      center: {
        lat, lng
      }
    });
    this.props.setMarkerLocation({ lat, lng });
    this.geoSuggest.clear();
  }

  render() {
    return (
      <div className="c-location-search">
        <Geosuggest
          ref={(node) => { this.geoSuggest = node; }}
          onSuggestSelect={this.onSuggestSelect}
          className="search-input"
          googleMaps={null}
        />
      </div>
    );
  }
}

export default LocationSearch;
