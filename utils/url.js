import Router from 'next/router';
import qs from 'query-string';

export function setUrlParam(param, value) {
  const location = {
    pathname: Router.router.pathname,
    query: Router.router.query
  };
  const query = qs.parse(window.location.search);

  if (value !== null && value !== undefined) {
    query[param] = value;
    location.query[param] = value;
  } else {
    delete query[param];
    delete location.query[param];
  }
  const as = qs.stringifyUrl({ url: window.location.pathname, query });

  Router.push(location, as, { shallow: true, scroll: false });
}
