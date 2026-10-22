export const FILTERS_REFS = [
  {
    key: 'country_ids',
    primary: true,
    name: 'Country',
    placeholder: 'All Countries',
  },
  {
    key: 'operator_id',
    primary: true,
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
    primary: true,
    name: 'Document name',
    placeholder: 'All Documents',
  },
  {
    key: 'status',
    primary: true,
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

export const DEFAULT_COLUMNS = ['country', 'operator', 'forest-type', 'fmu', 'document-name', 'document', 'status'];

export const COLUMN_GROUPS = [
  { id: 'producer', columns: ['country', 'operator', 'forest-type', 'fmu'] },
  { id: 'document', columns: ['document-name', 'document', 'status', 'legal-category', 'start-date', 'expire-date'] },
  { id: 'details', columns: ['source', 'reason', 'annexes'] },
];
