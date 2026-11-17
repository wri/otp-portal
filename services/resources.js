import { useEffect, useSyncExternalStore } from 'react';
import { useIntl } from 'react-intl';

import { fetchApi } from 'services/fetch-api';
import { dismissNotification } from 'services/notifications';

const NOT_LOADED = { data: undefined, loading: false, error: false };

/**
 * App-wide data several components show at once (menus, search, notifications). Fetched once, on
 * first use in the browser, and shared: reload() and set() update every reader.
 */
function createResource(fetcher) {
  let state = NOT_LOADED;
  let requested = false;
  const listeners = new Set();

  const update = (changes) => {
    state = { ...state, ...changes };
    listeners.forEach((listener) => listener());
  };

  const load = (locale) => {
    requested = true;
    update({ loading: true, error: false });
    return fetcher(locale).then(
      (data) => update({ data, loading: false }),
      (error) => {
        console.error(error);
        update({ loading: false, error: true });
      }
    );
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function useResource(enabled = true) {
    const { locale } = useIntl();
    useEffect(() => {
      if (enabled && !requested) load(locale);
    }, [enabled, locale]);

    return useSyncExternalStore(subscribe, () => state, () => NOT_LOADED);
  }

  return { use: useResource, reload: load, set: (data) => update({ data }) };
}

const countries = createResource((locale) => fetchApi('countries', {
  locale,
  params: {
    include: 'required-gov-documents',
    'fields[required-gov-documents]': 'id',
    'page[size]': 2000,
    sort: 'name'
  }
}));

const operators = createResource((locale) => fetchApi('operators', {
  locale,
  params: {
    include: 'country',
    'page[size]': 3000,
    'filter[country]': process.env.OTP_COUNTRIES_IDS,
    'filter[fa]': true,
    'fields[operators]': 'name,slug,country',
    'fields[countries]': 'name',
  }
}));

// The API has no free-text filter for FMUs, so they are indexed client-side like producers.
const searchFmus = createResource((locale) => fetchApi('fmus', {
  locale,
  params: {
    include: 'operator,country',
    'filter[country]': process.env.OTP_COUNTRIES_IDS,
    'fields[fmus]': 'name,operator,country',
    'fields[operators]': 'name,slug',
    'fields[countries]': 'name'
  }
}));

const notifications = createResource((locale) => fetchApi('notifications', { locale, auth: true }));

export const useCountries = countries.use;
export const useOperators = operators.use;
// loaded on the first search modal open, as only that needs it
export const useSearchFmus = searchFmus.use;
// `enabled` only for the instance that should load them; others read the shared copy
export const useNotifications = notifications.use;

// after the user edited one of their operators, so menus and search show the new name
export const reloadOperators = (locale) => operators.reload(locale);

export function dismissAllNotifications(list) {
  list.forEach((notification) => dismissNotification(notification.id));
  notifications.set([]);
}
