import { describe, it, expect } from 'vitest';

import { parseCountryDocumentation } from 'utils/country-documentation';

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

describe('parseCountryDocumentation', () => {
  it('is empty for a country without required documents', () => {
    expect(parseCountryDocumentation({})).toEqual([]);
  });

  it('flattens a required document and its first gov document', () => {
    const [doc] = parseCountryDocumentation({ 'required-gov-documents': [requiredDoc()] });

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

    expect(parseCountryDocumentation({ 'required-gov-documents': [file] })[0].url)
      .toBe('https://example.org/file.pdf');
    expect(parseCountryDocumentation({ 'required-gov-documents': [missing] })[0].url).toBeUndefined();
  });

  it('uses the parent group as the category and the group itself as the subcategory', () => {
    const nested = requiredDoc({
      'required-gov-document-group': { name: 'Permits', position: 3, parent: { name: 'Legal', position: 1 } }
    });

    expect(parseCountryDocumentation({ 'required-gov-documents': [nested] })[0]).toMatchObject({
      category: 'Legal',
      categoryPosition: 1,
      subCategory: 'Permits',
      subCategoryPosition: 3
    });
  });

  it('formats the expiry date when there is one', () => {
    const expiring = requiredDoc({ 'gov-documents': [govDoc({ 'expire-date': '2027-12-31T00:00:00Z' })] });

    expect(parseCountryDocumentation({ 'required-gov-documents': [expiring] })[0].endDate).toBe('2027/12/31');
  });
});
