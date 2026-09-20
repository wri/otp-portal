import { describe, it, expect } from 'vitest';

import { getParsedFilters } from '../observations/parsed-filters';

const OPTIONS = {
  country_id: [
    { id: 7, operators: [1, 2], observers: [20], fmus: [10, 11] },
    { id: 47, operators: [3], observers: [21], fmus: [12] }
  ],
  operator: [
    { id: 2, name: 'Bravo', fmus: [11] },
    { id: 1, name: 'Alpha', fmus: [10] },
    { id: 3, name: 'Charlie', fmus: [12] }
  ],
  observer_id: [
    { id: 21, name: 'CIEDD' },
    { id: 20, name: 'FODER' }
  ],
  fmu_id: [
    { id: 11, name: 'Nkola' },
    { id: 10, name: 'Cayo' },
    { id: 12, name: 'Ngombe' }
  ],
  category_id: [{ id: 5, subcategories: [50, 51] }],
  subcategory_id: [
    { id: 51, name: 'Safety' },
    { id: 50, name: 'Illegal logging' },
    { id: 52, name: 'Other' }
  ]
};

const parse = (data, options = OPTIONS) => getParsedFilters({ observations: { filters: { data, options } } });
const names = (list) => list.map((o) => o.name);

describe('observations getParsedFilters', () => {
  it('returns the filters with untouched options when nothing is selected', () => {
    const { data, options } = parse({});

    expect(data).toEqual({});
    expect(options).toBe(OPTIONS);
  });

  it('narrows operators, observers and fmus to the selected countries', () => {
    const { options } = parse({ country_id: ['7'] });

    expect(names(options.operator)).toEqual(['Alpha', 'Bravo']);
    expect(names(options.observer_id)).toEqual(['FODER']);
    expect(names(options.fmu_id)).toEqual(['Cayo', 'Nkola']);
  });

  it('narrows fmus to the selected operators', () => {
    const { options } = parse({ operator: ['2', '3'] });

    expect(names(options.fmu_id)).toEqual(['Ngombe', 'Nkola']);
  });

  it('narrows subcategories to the selected categories', () => {
    const { options } = parse({ category_id: ['5'] });

    expect(names(options.subcategory_id)).toEqual(['Illegal logging', 'Safety']);
  });

  it('applies country and operator filters together', () => {
    const { options } = parse({ country_id: ['7'], operator: ['1'] });

    expect(names(options.operator)).toEqual(['Alpha', 'Bravo']);
    expect(names(options.fmu_id)).toEqual(['Cayo']);
  });

  it('ignores filters until options are loaded', () => {
    expect(parse({ country_id: ['7'] }, {}).options).toEqual({});
  });
});
