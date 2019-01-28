glaucoma-risk-calculator REST API
=================================

REST API backend written on Node.JS in TypeScript with restify and waterline


## Install prerequisites

  0. node & npm (tested with node v10.15 and npm v6.7)
  1. Run: `npm install -g typescript typings bunyan`
  2. `cd` to directory you've cloned this repo into
  3. Run: `typings install`
  4. Run: `npm install`

## System dependencies

 - Redis
 - Postgres (set `RDBMS_URI` environment variable)

## Compile+run app

    tsc

Then

    node main.js

or with prettified log output:

    npm start
