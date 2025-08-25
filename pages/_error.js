/**
 * Creating a page named _error.js lets you override HTTP error messages
 */
import React from 'react';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Link from 'next/link';

import * as Sentry from '@sentry/nextjs';

const ErrorPage = ({ statusCode, router }) => {
  const css = (
    <Head>
      <style>{`
        body {
          margin: 10px 20px;
          font-family: sans-serif;
          color: #444;
          background-color: #eee;
        }
        `}</style>
    </Head>
  );

  let response;
  switch (statusCode) {
    case 0:
      response = (
        <div>
          {css}
          <h1>Client Side Server Error</h1>
          <p>A client side error occurred.</p>
        </div>
      );
      break;
        case 200: // Also display a 404 if someone requests /_error explicitly
    case 404:
      response = (
        <div>
          {css}
          <h1>Page Not Found</h1>
          <p>The page <strong>{ router.asPath }</strong> does not exist.</p>
          <p><Link href="/">Home</Link></p>
        </div>
      );
      break;
    case 500:
      response = (
        <div>
          {css}
          <h1>Internal Server Error</h1>
          <p>An internal server error occurred.</p>
        </div>
      );
      break;
    default:
      response = (
        <div>
          {css}
          <h1>HTTP { statusCode } Error</h1>
          <p>
            An <strong>HTTP { statusCode }</strong> error occurred while
            trying to access <strong>{ router.pathname }</strong>
          </p>
        </div>
      );
  }

  return response;
};

ErrorPage.getInitialProps = async (contextData) => {
  const { res, xhr } = contextData;
  const statusCode = res ? res.statusCode : (xhr ? xhr.status : 0); // eslint-disable-line

  await Sentry.captureUnderscoreErrorException(contextData);

  return { statusCode };
};

ErrorPage.propTypes = {
  statusCode: PropTypes.number.isRequired,
  router: PropTypes.object.isRequired,
};

export default withRouter(ErrorPage);
