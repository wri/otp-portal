#!/bin/sh
set -e

fnm use

# Ensure the mjml CLI is available for this Node version; install the v4 line
# (matching the mjml-rails 4.x gem) if it's missing.
if ! command -v mjml >/dev/null 2>&1; then
  echo 'mjml not found, installing mjml@4...'
  npm install -g mjml@4
fi

echo 'Starting API...'

cd ../../otp-api
RAILS_ENV=e2e bundle exec rails e2e:setup
RAILS_ENV=e2e bundle exec rails s &

echo 'Starting Portal...'
cd ../otp-portal/
fnm use
if [ "$1" = "dev" ]; then
  if [ "$COVERAGE" = "true" ]; then
    echo 'COVERAGE is ignored in dev: Turbopack does not run the istanbul instrumentation.'
  fi
  yarn dev
elif [ "$COVERAGE" = "true" ]; then
  yarn build:coverage && yarn start
else
  yarn build && yarn start
fi
