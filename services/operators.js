import API from 'services/api';
import { fetchApi } from 'services/fetch-api';
import { parseDocument } from 'utils/documents';

// Operator detail pages. These carry the session: owners and admins see unpublished documents
// and observations. `cache` is true when switching tabs, 'reload' after the user changed a document.

export function fetchOperatorBySlug(slug, { locale, loadFmus = false, cache = true } = {}) {
  return fetchApi('operators', {
    locale,
    auth: true,
    cache,
    params: {
      include: ['country', 'fmus', 'observations'].join(','),
      'fields[countries]': 'name,id,iso',
      'fields[observations]': 'id,hidden',
      ...(loadFmus ? {} : { 'fields[fmus]': 'name,id' }),
      'filter[slug]': slug
    }
  }).then((data) => {
    const operator = data[0];
    if (!operator) throw new Error('Operator not found');
    return { ...operator, loadedFMUS: loadFmus };
  });
}

export function fetchOperator(id, { locale } = {}) {
  return fetchApi(`operators/${id}`, { locale, auth: true, params: { include: 'country,fmus' } });
}

export function fetchOperatorDocumentation(operatorId, date, { locale, cache = true } = {}) {
  return fetchApi('operator-document-histories', {
    locale,
    auth: true,
    cache,
    params: {
      include: [
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
        'operator-document-annexes',
        'fmu',
      ].join(','),
      'fields[fmus]': 'name',
      'filter[operator-id]': operatorId,
      'filter[date]': date,
    }
  });
}

export function fetchOperatorObservations(operatorId, { locale, cache = true } = {}) {
  return fetchApi('observations', {
    locale,
    auth: true,
    cache,
    params: {
      include: [
        'country', 'fmu', 'observers', 'severity', 'subcategory',
        'subcategory.category', 'observation-report', 'observation-documents',
        'relevant-operators', 'operator',
      ].join(','),
      'fields[fmus]': 'name',
      'filter[operator]': operatorId,
      'filter[hidden]': 'all'
    }
  });
}

export function fetchOperatorPublicationAuthorization(operatorId, { locale, cache = true } = {}) {
  return fetchApi('operator-documents', {
    locale,
    auth: true,
    cache,
    params: {
      include: [
        'required-operator-document',
        'required-operator-document.required-operator-document-group',
      ].join(','),
      'filter[operator-id]': operatorId,
      'filter[contract-signature]': true,
    }
  }).then((data) => {
    const doc = data.find((d) => d['required-operator-document']['contract-signature']);
    return doc ? parseDocument(doc) : null;
  });
}

export function fetchOperatorTimeline(operatorId, { locale, cache = true } = {}) {
  return fetchApi('score-operator-documents', {
    locale,
    auth: true,
    cache,
    params: { 'filter[operator]': operatorId }
  });
}

// Every operator's slug, for the sitemap
export function fetchOperatorSlugs(locale) {
  return fetchApi('operators', { locale, params: { 'page[size]': 3000, 'fields[operators]': 'slug' } });
}

// FMUs in the country not assigned to an operator yet, offered when registering one
export function fetchFreeFmus(countryId, locale) {
  return fetchApi('fmus', { locale, params: { 'filter[country]': countryId, 'filter[free]': true } });
}

export function saveOperator({ body }) {
  return API.post('operators', { body });
}

export function updateOperator({ body, id, locale }) {
  return API.patch(`operators/${id}`, { body, queryParams: { locale } });
}
