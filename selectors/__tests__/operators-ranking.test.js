import { describe, it, expect } from 'vitest';

import { getActiveCountries, getTable } from '../operators-ranking';

const OPERATORS = [
  {
    id: '1',
    name: 'AFRIWOOD INDUSTRIES',
    slug: 'afriwood-industries',
    country: { id: '7', name: 'Congo' },
    fmus: [{ name: 'Nkola', 'certification-fsc': true }],
    score: 0.5,
    ranking: 1,
    observations: [],
    'obs-per-visit': 2,
    'percentage-valid-documents-all': 0.75
  },
  {
    id: '2',
    name: 'Lorem Ipsum',
    slug: 'lorem-ipsum',
    country: { id: '47', name: 'Cameroon' },
    fmus: [{ name: 'Ngombe', 'certification-olb': true }, { name: 'Cayo' }],
    ranking: 2,
    observations: [],
    'obs-per-visit': 0
  }
];

const state = (filters = {}) => ({
  operatorsRanking: {
    data: OPERATORS,
    filters: {
      data: { country: [], certification: [], operator: '', fmu: '', ...filters },
      options: {
        country: [
          { value: 7, iso: 'COG' },
          { value: 47, iso: 'CMR' }
        ]
      }
    }
  }
});
const tableNames = (filters) => getTable(state(filters)).map((o) => o.name);

describe('getActiveCountries', () => {
  it('returns every country iso without a country filter', () => {
    expect(getActiveCountries(state())).toEqual(['COG', 'CMR']);
  });

  it('returns only the selected countries', () => {
    expect(getActiveCountries(state({ country: [47] }))).toEqual(['CMR']);
  });
});

describe('getTable', () => {
  it('maps operators to table rows', () => {
    const [row, other] = getTable(state());

    expect(row).toMatchObject({
      id: '1',
      name: 'AFRIWOOD INDUSTRIES',
      slug: 'afriwood-industries',
      ranking: 1,
      score: 0.5,
      obsPerVisit: 2,
      documentation: '75',
      fmusLenght: 1,
      country: 'Congo'
    });
    expect(other).toMatchObject({ score: 0, documentation: 0, fmusLenght: 2 });
  });

  it('filters by country', () => {
    expect(tableNames({ country: [47] })).toEqual(['Lorem Ipsum']);
  });

  it('filters by fmu certification', () => {
    expect(tableNames({ certification: ['fsc'] })).toEqual(['AFRIWOOD INDUSTRIES']);
    expect(tableNames({ certification: ['fsc', 'olb'] })).toEqual(['AFRIWOOD INDUSTRIES', 'Lorem Ipsum']);
  });

  it('searches by operator and fmu name', () => {
    expect(tableNames({ operator: 'lorem' })).toEqual(['Lorem Ipsum']);
    expect(tableNames({ fmu: 'nkola' })).toEqual(['AFRIWOOD INDUSTRIES']);
  });
});
