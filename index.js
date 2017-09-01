require('dotenv').load();

const express = require('express');
const session = require('express-session');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const next = require('next');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { parse } = require('url');

const LossLayer = require('./utils/lossLayer');

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

// Secret used to encrypt session data stored on the server
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';

const app = next({
  dir: '.',
  dev: (process.env.NODE_ENV === 'development')
});

const handle = app.getRequestHandler();
const server = express();

// configure Express
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET || 'keyboard cat']
}));
server.use(session({
  secret: process.env.SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.prepare()
  .then(() => {
    // Loss layer
    server.get('/loss-layer/:z/:x/:y', (req, res) => {
      const { z, x, y } = req.params;
      const tileDirPath = `${__dirname}/static/tiles`;
      const tilePath = `${tileDirPath}/${z}/${x}/${y}.png`;

      // If image was created before it would be send
      if (fs.existsSync(tilePath)) {
        const imageTile = fs.readFileSync(tilePath);
        res.contentType('png');
        return res.end(imageTile, 'binary');
      }

      // Creating new tile
      const layer = new LossLayer(z, x, y);
      return layer.getImageTile('png', (tile) => {
        // Saving image for next request
        mkdirp(`${tileDirPath}/${z}/${x}/${y}`, (err) => {
          fs.writeFile(tilePath, tile);
        });

        res.contentType('png');
        res.end(tile);
      });
    });

    server.get('/operators', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(req, res, '/operators', Object.assign(req.params, query));
    });

    server.get('/operators/:id', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(req, res, '/operators-detail', Object.assign(req.params, query));
    });

    server.get('/operators/:id/:tab', (req, res) => {
      const { query } = parse(req.url, true);
      return app.render(req, res, '/operators-detail', Object.assign(req.params, query));
    });

    server.get('/observations', (req, res) => app.render(req, res, '/observations', Object.assign(req.params, req.query)));
    server.get('/observations/:tab', (req, res) => app.render(req, res, '/observations', Object.assign(req.params, req.query)));

    server.get('/about', (req, res) => app.render(req, res, '/about', req.params));

    // HELP
    server.get('/help', (req, res) => app.render(req, res, '/help', req.params));
    server.get('/help/:tab', (req, res) => app.render(req, res, '/help', req.params));

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res));

    // Set vary header (good practice)
    // Note: This overrides any existing 'Vary' header but is okay in this app
    server.use((req, res, next) => {
      res.setHeader('Vary', 'Accept-Encoding');
      next();
    });

    server.listen(process.env.PORT, (err) => {
      if (err) {
        throw err;
      }
      console.log(`> Ready on http://localhost:${process.env.PORT} [${process.env.NODE_ENV}]`);
    });
  })
  .catch((err) => {
    console.error('An error occurred, unable to start the server');
    console.error(err);
  });
