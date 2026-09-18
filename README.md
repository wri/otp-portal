# Open Timber Portal

- Landing: http://www.opentimberportal.org
- App: http://otp.vizzuality.com/

## Running locally in development mode

To get started in development mode:

1. Clone the repository.
2. Install dependencies with `yarn install`.
3. Generate the required `lang` folder with `yarn run transifex:pull`. In case you didn't read this, it's built into the `dev` command.
4. Copy the `.env.default` file into `.env` (ask for the app keys).
5. Run the development server with `yarn dev`.

## Building and deploying in production

If you wanted to run this site in production run:

```
yarn install
yarn build
yarn start
```

You should run the the build step again any time you make changes to pages or components.

`yarn dev` uses Turbopack, `yarn build` uses webpack (`--webpack`). Webpack builds are much
slower but stay within the memory the staging box has; keep both paths working.

Next 16 no longer prints per-route bundle sizes. `yarn stats` prints them (gzipped, the way
Next reported them) for the last build
(`yarn stats <dir>` for another build dir, `BUILD_DIR` is honoured too). Passing two build dirs
diffs them, which is what `yarn build:stats` does after building with both bundlers.

## Code coverage

Unit and e2e coverage are collected separately and merged into one report in `coverage/combined`:

```
yarn test:coverage                  # unit, also writes its own report to coverage/unit
yarn build:coverage && yarn start   # or `COVERAGE=true ./start-server.sh` from e2e/
cd e2e && rm -rf ../coverage/e2e && COVERAGE=true yarn cypress run && cd ..
yarn coverage:report                # merge whatever is in coverage/unit and coverage/e2e
```

Either half can be skipped; the report lists every file in `.nycrc.json` and shows untested ones
at 0%. E2e coverage includes server-side rendering, which is read from `/api/__coverage__`.
Remember to rebuild with `yarn build` afterwards, as the instrumented build is slower.

## Regenerate Home Page Static Map

Home page map could be regenerated using `tools/map-screenshot/index.js` script.
It's using puppeteer to take screenshot of locally running web page, that's why it's esential to first `yarn build` project and then `yarn start`.
Make sure you have the map page enabled - set `FEATURE_MAP_PAGE` to `true` in .env file.

After creating screenshot run `cwebp -q 75 static/images/home/bg-map.jpg -o static/images/home/bg-map.webp` to create webp image.

## Deploy landing

```
git push heroku landing:master
```

## Deploy app

PRODUCTION

```
git push deploy master
```

STAGING

```
git push staging develop
```
