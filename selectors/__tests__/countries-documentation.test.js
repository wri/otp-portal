import { describe, it, expect } from 'vitest';

import { getParsedDocumentation, getAllParsedDocumentation } from '../countries-detail/documentation';

const govDoc = (overrides = {}) => ({
  id: '100',
  type: 'gov-documents',
  status: 'doc_valid',
  reason: null,
  link: 'https://example.org/doc',
  units: null,
  value: null,
  'start-date': '2024-03-04T00:00:00Z',
  'expire-date': null,
  ...overrides
});

const requiredDoc = (overrides = {}) => ({
  id: '1',
  name: 'Forest law',
  explanation: 'The law in force',
  position: 1,
  'document-type': 'link',
  'gov-documents': [govDoc()],
  'required-gov-document-group': { name: 'Legal', position: 2, parent: null },
  ...overrides
});

const state = (data, documentation = {}) => ({ countriesDetail: { data, documentation } });

describe('getParsedDocumentation', () => {
  it('is empty for a country without required documents', () => {
    expect(getParsedDocumentation(state({}))).toEqual([]);
  });

  it('flattens a required document and its first gov document', () => {
    const [doc] = getParsedDocumentation(state({ 'required-gov-documents': [requiredDoc()] }));

    expect(doc).toEqual({
      id: '100',
      docId: '100',
      docType: 'link',
      requiredDocId: '1',
      url: 'https://example.org/doc',
      type: 'gov-documents',
      title: 'Forest law',
      explanation: 'The law in force',
      position: 1,
      category: 'Legal',
      categoryPosition: 2,
      subCategory: null,
      subCategoryPosition: null,
      status: 'doc_valid',
      reason: null,
      startDate: '2024/03/04',
      endDate: null,
      link: 'https://example.org/doc',
      units: null,
      value: null
    });
  });

  it('takes the url from the attachment for file documents', () => {
    const file = requiredDoc({
      'document-type': 'file',
      'gov-documents': [govDoc({ attachment: { url: 'https://example.org/file.pdf' } })]
    });
    const missing = requiredDoc({ 'document-type': 'file' });

    expect(getParsedDocumentation(state({ 'required-gov-documents': [file] }))[0].url)
      .toBe('https://example.org/file.pdf');
    expect(getParsedDocumentation(state({ 'required-gov-documents': [missing] }))[0].url).toBeUndefined();
  });

  it('uses the parent group as the category and the group itself as the subcategory', () => {
    const nested = requiredDoc({
      'required-gov-document-group': { name: 'Permits', position: 3, parent: { name: 'Legal', position: 1 } }
    });

    expect(getParsedDocumentation(state({ 'required-gov-documents': [nested] }))[0]).toMatchObject({
      category: 'Legal',
      categoryPosition: 1,
      subCategory: 'Permits',
      subCategoryPosition: 3
    });
  });

  it('formats the expiry date when there is one', () => {
    const expiring = requiredDoc({ 'gov-documents': [govDoc({ 'expire-date': '2027-12-31T00:00:00Z' })] });

    expect(getParsedDocumentation(state({ 'required-gov-documents': [expiring] }))[0].endDate).toBe('2027/12/31');
  });
});

describe('getAllParsedDocumentation', () => {
  const countryDoc = (overrides = {}) => ({
    id: '200',
    type: 'country-documents',
    status: 'doc_valid',
    'start-date': '2024-01-01T00:00:00Z',
    'expire-date': '2026-01-01T00:00:00Z',
    'required-country-document': {
      id: '2',
      name: 'Zeta report',
      'required-country-document-group': { name: 'Reports', position: 1 }
    },
    ...overrides
  });

  it('is empty without documentation', () => {
    expect(getAllParsedDocumentation(state({}, { data: [] }))).toEqual([]);
    expect(getAllParsedDocumentation(state({}, {}))).toEqual([]);
  });

  it('drops documents that were not provided', () => {
    const docs = [countryDoc(), countryDoc({ id: '201', status: 'doc_not_provided' })];

    expect(getAllParsedDocumentation(state({}, { data: docs })).map((d) => d.id)).toEqual(['200']);
  });

  it('drops documents without a required document and sorts by title', () => {
    const alpha = countryDoc({
      id: '202',
      'required-country-document': { ...countryDoc()['required-country-document'], id: '3', name: 'Alpha report' }
    });
    const orphan = countryDoc({ id: '203', 'required-country-document': undefined });

    const parsed = getAllParsedDocumentation(state({}, { data: [countryDoc(), alpha, orphan] }));

    expect(parsed.map((d) => d.title)).toEqual(['Alpha report', 'Zeta report']);
    expect(parsed[1]).toEqual({
      id: '200',
      requiredDocId: '2',
      type: 'country-documents',
      title: 'Zeta report',
      category: 'Reports',
      categoryPosition: 1,
      status: 'doc_valid',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2026-01-01T00:00:00Z')
    });
  });
});
