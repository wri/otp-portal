import { fetchApi } from 'services/fetch-api';

// Active countries, e.g. to pick an operator's country when registering one
export function fetchCountries(locale) {
  return fetchApi('countries', { locale });
}

// Every country, inactive ones too, for the newsletter sign-up form
export function fetchAllCountries(locale) {
  return fetchApi('countries', { locale, params: { 'page[size]': 500, 'filter[is-active]': 'all' } });
}

// Countries that have a country page, i.e. some required government documents
export function fetchCountriesWithGovDocuments(locale) {
  return fetchApi('countries', {
    locale,
    params: {
      include: 'required-gov-documents',
      'fields[country]': 'id',
      'fields[required-gov-documents]': 'id',
      'page[size]': 2000
    }
  }).then((data) => data.filter((c) => (c['required-gov-documents'] || []).length));
}
