import { describe, it, expect } from 'vitest';

import { getParsedFilters } from '../database/filters';

const OPTIONS = {
  country_ids: [
    { id: 7, operators: [1, 2], fmus: [10, 11], required_operator_document_ids: [100], forest_types: [{ id: 1 }] },
    { id: 47, operators: [3], fmus: [12], required_operator_document_ids: [101], forest_types: [{ id: 2 }] }
  ],
  operator_id: [
    { id: 2, name: 'Bravo', fmus: [11], forest_types: [{ id: 1 }] },
    { id: 1, name: 'Alpha', fmus: [10], forest_types: [] },
    { id: 3, name: 'Charlie', fmus: [12], forest_types: [{ id: 2 }] }
  ],
  fmu_id: [
    { id: 11, name: 'Nkola' },
    { id: 10, name: 'Cayo' },
    { id: 12, name: 'Ngombe' }
  ],
  required_operator_document_id: [
    { id: 101, name: 'Tax clearance' },
    { id: 100, name: 'Business license' }
  ],
  forest_types: [
    { id: 2, name: 'Forest management unit' },
    { id: 1, name: 'Communal forest' }
  ],
  legal_categories: [
    { id: 5, required_operator_document_ids: [101] }
  ]
};

const parse = (filters, options = OPTIONS) => getParsedFilters({ database: { filters: { data: filters, options } } });
const names = (list) => list.map((o) => o.name);

describe('getParsedFilters', () => {
  it('passes options through without active filters', () => {
    expect(parse({}).options).toBe(OPTIONS);
  });

  it('narrows options to the selected countries, sorted by name', () => {
    const { options } = parse({ country_ids: ['7'] });

    expect(names(options.operator_id)).toEqual(['Alpha', 'Bravo']);
    expect(names(options.fmu_id)).toEqual(['Cayo', 'Nkola']);
    expect(names(options.required_operator_document_id)).toEqual(['Business license']);
    expect(names(options.forest_types)).toEqual(['Communal forest']);
  });

  it('narrows fmus and forest types to the selected operators', () => {
    const { options } = parse({ operator_id: ['2', '3'] });

    expect(names(options.fmu_id)).toEqual(['Ngombe', 'Nkola']);
    expect(names(options.forest_types)).toEqual(['Communal forest', 'Forest management unit']);
    expect(options.operator_id).toBe(OPTIONS.operator_id);
  });

  it('narrows documents to the selected legal categories', () => {
    const { options } = parse({ legal_categories: ['5'] });

    expect(names(options.required_operator_document_id)).toEqual(['Tax clearance']);
  });

  it('ignores filters until options are loaded', () => {
    expect(parse({ country_ids: ['7'] }, {}).options).toEqual({});
  });
});
