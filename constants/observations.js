const FILTERS_REFS = [
  {
    key: 'hidden',
    name: null,
    type: 'checkbox',
    description: 'Display observations that are more than five years old',
    valueTransform: (value) => value ? 'all' : null
  },
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
    key: 'operator',
    name: 'Producer',
    placeholder: 'All producers'
  },
  {
    key: 'fmu_id',
    name: 'Forest Management Unit',
    placeholder: 'All FMUs'
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
    key: 'subcategory_id',
    name: 'subcategories',
    placeholder: 'All Subcategories'
  },
  {
    key: 'validation_status',
    name: 'Status',
    placeholder: 'All status'
  },
  {
    key: 'severity_level',
    name: 'Severity',
    placeholder: 'All Severities'
  },
  {
    key: 'years',
    name: 'Year',
    placeholder: 'All Years'
  },
  {
    key: 'observation-report',
    name: 'Report',
    placeholder: 'All reports'
  },
];

export {
  FILTERS_REFS
};
