# cp-zen-platform

## Install:

```
npm install
```

To insert test users into the mongo database (development), run:
```
node scripts/insert-test-users.js
```

It will add manager@example.com/test and admin@example.com/test users to the database.

## Service dependencies

Requires the following micro-services to be running:

cp-core-services/countries
cp-core-services/dojos

See https://github.com/CoderDojo/cp-core-services

## Configuration

Ensure configuration file for the running environment exists and has the correct options. default environment is development, options read from web/options.development.js.

## Run

Start Server:

`npm start`

