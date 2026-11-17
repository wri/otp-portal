export const FILTERS_REFS = [
  {
    key: 'country_ids',
    name: 'Country',
    placeholder: 'All Countries',
  },
  {
    key: 'operator_id',
    name: 'Producer',
    placeholder: 'All Producers',
  },
  {
    key: 'forest_types',
    name: 'Forest Type',
    placeholder: 'All Forest Types',
  },
  {
    key: 'fmu_id',
    name: 'Forest Management Unit',
    placeholder: 'All FMUs',
  },
  {
    key: 'required_operator_document_id',
    name: 'Document name',
    placeholder: 'All Documents',
  },
  {
    key: 'status',
    name: 'Status',
    placeholder: 'All Status',
  },
  {
    key: 'legal_categories',
    name: 'Legal Categories',
    placeholder: 'All Legal categories',
  },
  {
    key: 'source',
    name: 'Source',
    placeholder: 'All Sources',
  },
];

// Which option lists a selected filter narrows, and the ids the selected item allows in each
export const FILTER_RULES = {
  country_ids: {
    operator_id: (country) => country.operators,
    fmu_id: (country) => country.fmus,
    required_operator_document_id: (country) => country.required_operator_document_ids,
    forest_types: (country) => country.forest_types.map((type) => type.id)
  },
  operator_id: {
    fmu_id: (operator) => operator.fmus,
    forest_types: (operator) => operator.forest_types.map((type) => type.id)
  },
  legal_categories: {
    required_operator_document_id: (category) => category.required_operator_document_ids
  }
};
