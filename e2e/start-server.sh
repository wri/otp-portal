#!/bin/sh
set -e

echo 'Starting API...'

cd ../../otp-api
# POSTGRES_DATABASE=fti_e2e bundle exec rails db:migrate
RAILS_ENV=e2e bundle exec rails e2e:setup
RAILS_ENV=e2e bundle exec rails s &

echo 'Starting Portal...'
cd ../otp-portal/
fnm use
if [ $1 = "dev" ]; then
  yarn dev
else
  yarn build && yarn start
fi
