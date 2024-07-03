/* eslint-disable no-console */
require('dotenv').config();

const express = require('express');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const next = require('next');

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
  hostname: 'localhost',
  port: process.env.PORT
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

app
  .prepare()
  .then(() => {
    // LOGIN
    server.post('/login', (req, res) => {
      fetch(`${process.env.OTP_API}/login`, {
        method: 'POST',
        headers: {
          'OTP-API-KEY': process.env.OTP_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(response.statusText);
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

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res));

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
