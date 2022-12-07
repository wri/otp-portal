#!/bin/sh

./restore-db.sh

echo 'Starting API...'

cd ../../otp-api
POSTGRES_DATABASE=fti_api_cypress bundle exec rails db:migrate
POSTGRES_DATABASE=fti_api_cypress bundle exec rails s &

echo 'Starting Portal...'
cd ../otp-portal/
fnm use
if [ $1 = "dev" ]; then
  yarn dev
else
  yarn build && yarn start
fi
