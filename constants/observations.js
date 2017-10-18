import React from 'react';

const TABS_OBSERVATIONS = [
  {
    label: 'Observations List',
    value: 'observations-list'
  },
  {
    label: 'Map View',
    value: 'map'
  }
];

const FILTERS_REFS = [
  {
    key: 'observation_type',
    name: 'Type',
    placeholder: 'All Types'
  },
  {
    key: 'country_id',
    name: 'Country',
    placeholder: 'All Countries'
  },
  {
    key: 'years',
    name: 'Year',
    placeholder: 'All Years'
  },
  {
    key: 'observer_id',
    name: 'Monitor',
    placeholder: 'All Monitors'
  },
  {
    key: 'category_id',
    name: 'categories',
    placeholder: 'All Categories'
  },
  {
    key: 'severity_level',
    name: 'Severity',
    placeholder: 'All Severities'
  }
];

export { TABS_OBSERVATIONS, FILTERS_REFS };
