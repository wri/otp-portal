import React, { useRef } from 'react';
// TODO: when bringing back the geosuggest, make sure to upgrade to newest version and upgrade this component as well
// import Geosuggest from 'react-geosuggest';
import PropTypes from 'prop-types';

const LocationSearch = ({ setMapLocation, setMarkerLocation }) => {
  const geoSuggestRef = useRef(null);

  const onSuggestSelect = (e) => {
    if (!e) return;

    const { lat, lng } = e.location;
    setMapLocation({
      center: {
        lat, lng
      }
    });
    setMarkerLocation({ lat, lng });
    geoSuggestRef.current?.clear();
  };

  return (
    <div className="c-location-search">
      {/* <Geosuggest
        ref={geoSuggestRef}
        onSuggestSelect={onSuggestSelect}
        className="search-input"
        googleMaps={null}
      /> */}
    </div>
  );
};

LocationSearch.propTypes = {
  setMapLocation: PropTypes.func,
  setMarkerLocation: PropTypes.func
};

export default LocationSearch;
