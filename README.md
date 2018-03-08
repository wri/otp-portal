# Open Timber Portal

Landing: http://www.opentimberportal.org
App: http://otp.vizzuality.com/


## Running locally in development mode

To get started in development mode, just clone the repository and run:

    npm install
    npm run dev

## Building and deploying in production

If you wanted to run this site in production run:

    npm install
    npm run build
    npm start

You should run the the build step again any time you make changes to pages or
components.

## Deploy landing

    git push heroku landing:master

## Deploy app

    git push deploy master

