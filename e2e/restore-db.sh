#!/bin/sh
set -e

cd ../../otp-api
# ./restore-test.sh test_db_backup.dump fti_api_cypress
RAILS_ENV=e2e bundle exec rails e2e:db_reset

# cd ../otp-api
# POSTGRES_DATABASE=fti_api_cypress bundle exec rails db:migrate
