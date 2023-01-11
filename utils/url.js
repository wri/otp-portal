import Router from 'next/router';

export function setUrlParam(param, value) {
  const location = {
    pathname: Router.router.pathname,
    query: Router.router.query
  };

  if (value !== null && value !== undefined) {
    location.query[param] = value;
  } else {
    delete location.query[param];
  }

  Router.push(location, null, { shallow: true, scroll: false });
}
