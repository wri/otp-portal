import React from 'react';
import PropTypes from 'prop-types';

const ARRAY = [
  {
    iso3: 'CMR',
    name: 'Cameroon',
    urls: [
      'http://cmr-data.forest-atlas.org/datasets/concessions-forestieres/data',
      'http://cmr-data.forest-atlas.org/datasets/soci%C3%A9tes-forestieres/data',
      'http://cmr-data.forest-atlas.org/datasets/ventes-de-coupe/data',
      'http://cmr-data.forest-atlas.org/datasets/soci%C3%A9tes-forestieres/data'
    ]
  },
  {
    iso3: 'CAF',
    name: 'Central African Republic',
    urls: [
      'http://data-mefcp.opendata.arcgis.com/datasets/permis-dexploitation-et-dam%C3%A9nagement/data'
    ]
  },
  {
    iso3: 'COG',
    name: 'Congo',
    urls: [
      'http://cog-data.forest-atlas.org/datasets/concessions-foresti%C3%A8res-/data'
    ]
  },
  {
    iso3: 'COD',
    name: 'Democratic republic of congo',
    urls: [
      'http://cod-data.forest-atlas.org/datasets/forest-conncession-agreement/data'
    ]
  },
  {
    iso3: 'GAB',
    name: 'Gabon',
    urls: [
      'http://gab-data.forest-atlas.org/datasets/concessions-foresti%C3%A8res/data?geometry=5.87%2C-0.608%2C16.323%2C1.315'
    ]
  }
];

export default function FAAttributions() {
  return (
    <div className="c-fa-attributions">
      {ARRAY.map(attr => (
        <div className="attributions--item">
          <h3>{attr.name}</h3>
          <ul>
            {attr.urls.map(u => (
              <li><a target="_blank" rel="noopener noreferrer" href={u}>{u}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}


FAAttributions.propTypes = {
};
