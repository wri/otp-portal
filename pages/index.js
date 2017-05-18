/**
 * The index page uses a layout page that pulls in header and footer components
 */
import Link from 'next/link';
import React from 'react';
import Page from 'components/layout/page';
import Layout from 'components/layout/layout';
import Head from 'components/layout/head';

export default class extends Page {

  render() {
    return (
      <Layout session={this.props.session}>
        <Head
          title="Home"
          description="Home description"
        />
        <h2>About this project</h2>
        <p>
          This is a starter <a href="https://zeit.co/blog/next">Next.js 2.0</a> project
          that shows how to put together a simple website with server and client
          side rendering powered by Next.js, which uses React.
        </p>
        <p>
          Like all Next.js projects it features automatic pre-fetching of templates
          with a ServiceWorker, renders pages both client and server side and live
          reloading in development. It also shows how to use features new in
          Next.js version 2.0 like integration with Express for custom route handling.
        </p>
        <p>
          There are practical examples with header, footer and layout files,
          how to add page-specific CSS and JavaScript and header elements,
          how to write code that does asynchronous data fetching, how to write
          different logic for fetching data on the client and server if you need
          to.
        </p>
        <p>
          It includes session support (with CSRF and XSS protection), email
          based sign-in sytem and integrates with Passport to support signing in
          with Facebook, Google, Twitter and other sites that support oAuth.
        </p>
        <p>
          All functionality works both client and server side - including
          without JavaScript support in the browser.
        </p>
        <h3>Examples</h3>
        <ul>
          <li><Link prefetch href="/async"><a>Asynchronous data fetching</a></Link> - How to include data from an API or database</li>
          <li><Link prefetch href="/auth/signin"><a>Authentication</a></Link> - Authentication via email and Facebook, Google+ and Twitter</li>
        </ul>
        <p>
          If you want to see how custom 404, 500 and other HTTP errors are handled take a look at pages/_error.js
        </p>
        <h3>Configuration</h3>
        <p>
          For information on how to build and deploy see <a href="https://github.com/iaincollins/nextjs-starter/blob/master/README.md">README.md</a>
        </p>
        <p>
          For tips on configuring authentication see <a href="https://github.com/iaincollins/nextjs-starter/blob/master/AUTHENTICATION.md">AUTHENTICATION.md</a>
        </p>
        <p>
          You can find the source for this project on GitHub at <Link href="https://github.com/iaincollins/nextjs-starter"><a>https://github.com/iaincollins/nextjs-starter</a></Link>
        </p>
      </Layout>
    );
  }

}
