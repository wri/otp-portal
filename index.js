/* eslint-disable no-console */
require('dotenv').load();

const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const request = require('request-promise');
const bodyParser = require('body-parser');
const next = require('next');
const { parse } = require('url');

process.on('uncaughtException', (err) => {
  console.info(`Uncaught Exception: ${err}`);
});

process.on('unhandledRejection', (reason, p) => {
  console.info('Unhandled Rejection: Promise:', p, 'Reason:', reason);
});

// Default when run with `npm start` is 'production' and default port is '80'
// `npm run dev` defaults mode to 'development' & port to '3000'
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || 80;

if (!process.env.SECRET) throw new Error('Missing session SECRET')

const app = next({
  dir: '.',
  dev: process.env.NODE_ENV === 'development',
});

const handle = app.getRequestHandler();
const server = express();

// configure Express
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(
  cookieSession({
    name: 'session',
    keys: [process.env.SECRET],
  })
);

const homeRedirect = (req, res) => res.redirect(req.params.locale ? `/${req.params.locale}` : '/');
const notFound = (req, res) => {
  res.status(404);

  return app.render(
    req,
    res,
    '/_error',
    Object.assign(req.params, req.query)
  );
}
const onlyAuthenticated = (req, res) => {
  if (!req.session.user) return homeRedirect(req, res);

  return handle(req, res);
}

app
  .prepare()
  .then(() => {
    // COUNTRIES
    server.get('/:locale?/countries/detail', notFound);
    if (process.env.FEATURE_COUNTRY_PAGES === 'true') {
      server.get('/:locale?/countries/:id/:tab?', (req, res) => {
        const { query } = parse(req.url, true);
        return app.render(
          req,
          res,
          '/countries/detail',
          Object.assign(req.params, query)
        );
      });
    } else {
      server.get('/:locale?/countries', homeRedirect);
      server.get('/:locale?/countries/:id/:tab?', homeRedirect);
    }

    // MAP only development
    if (process.env.FEATURE_MAP_PAGE !== 'true') {
      server.get('/:locale?/map', notFound);
    }

    // PROFILE
    server.get('/:locale?/profile', onlyAuthenticated);

    // OPERATORS
    server.get('/:locale?/operators/edit', onlyAuthenticated);
    server.get('/:locale?/operators/detail', notFound);
    server.get('/:locale?/operators/new', (req, res) =>
      app.render(
        req,
        res,
        '/operators/new',
        Object.assign(req.params, req.query)
      )
    );
    server.get('/:locale?/operators/:id/:tab?', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(
        req,
        res,
        '/operators/detail',
        Object.assign(req.params, query)
      );
    });

    // OBSERVATIONS
    server.get('/:locale?/observations/:tab', (req, res) =>
      app.render(
        req,
        res,
        '/observations',
        Object.assign(req.params, req.query)
      )
    );

    server.get('/:locale?/help/:tab', (req, res) =>
      app.render(req, res, '/help', Object.assign(req.params, req.query))
    );

    // LOGIN
    server.post('/login', (req, res) => {
      request({
        url: `${process.env.OTP_API}/login`,
        headers: {
          'OTP-API-KEY': process.env.OTP_API_KEY,
        },
        body: req.body,
        method: 'POST',
        json: true,
      })
        .then((data) => {
          req.session.user = data;
          res.json(data);
        })
        .catch(() => {
          res.status(401).send('Something went wrong!!. User unauthorized.');
        });
    });

    server.delete('/logout', (req, res) => {
      req.session = null;
      res.json({});
    });

    server.use(
      '/static',
      express.static(`${__dirname}/static`, {
        maxAge: '365d',
      })
    );

    server.get(/^\/_next\/static\/(fonts|images)\//, (_, res, nextHandler) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      nextHandler();
    });

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res));

    // Set vary header (good practice)
    // Note: This overrides any existing 'Vary' header but is okay in this app
    server.use((req, res, _next) => {
      res.setHeader('Vary', 'Accept-Encoding');
      _next();
    });

    server.listen(process.env.PORT, (err) => {
      if (err) {
        throw err;
      }
      console.log(
        `> Ready on http://localhost:${process.env.PORT} [${process.env.NODE_ENV}]`
      );
    });
  })
  .catch((err) => {
    console.error('An error occurred, unable to start the server');
    console.error(err);
  });
