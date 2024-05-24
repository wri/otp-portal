import Router from 'next/router';

export function setUrlParam(param, value) {
  const location = {
    pathname: Router.router.pathname,
    query: Router.router.query
  };
  const query = new URLSearchParams(window.location.search);

  if (value !== null && value !== undefined) {
    query.set(param, value);
    location.query[param] = value;
  } else {
    query.delete(param);
    delete location.query[param];
  }
  const queryString = query.toString();
  const as = window.location.pathname + (queryString ? `?${queryString}` : '');

  Router.push(location, as, { shallow: true, scroll: false });
}
