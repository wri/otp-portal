import { fetchApi } from 'services/fetch-api';

// A CMS page by slug (terms, privacy-policy), or undefined when there is none
export function fetchPage(slug, locale) {
  return fetchApi('pages', { locale, params: { 'filter[slug]': slug } }).then((data) => data[0]);
}

export function fetchNewsletters(locale) {
  return fetchApi('newsletters', { locale });
}
