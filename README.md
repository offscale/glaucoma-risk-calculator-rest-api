glaucoma-risk-calculator REST API
=================================

[![License](https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Build Status](https://travis-ci.org/offscale/glaucoma-risk-calculator-rest-api.svg?branch=master)](https://travis-ci.org/offscale/glaucoma-risk-calculator-rest-api)
[![Coverage Status](https://coveralls.io/repos/github/offscale/glaucoma-risk-calculator-rest-api/badge.svg)](https://coveralls.io/github/offscale/glaucoma-risk-calculator-rest-api)
![David dependency status for latest release](https://david-dm.org/offscale/glaucoma-risk-calculator-rest-api.svg)

REST API backend written on Node.JS in TypeScript with restify and waterline


## Install prerequisites

  0. node & npm (tested with node v10.16.0 & npm v6.10.1)
  1. Run: `npm install -g typings typescript bunyan`
  2. `cd` to directory you've cloned this repo into
  3. Run: `typings install`
  4. Run: `npm install`

## System dependencies

  - Redis (optionally set `REDIS_HOST` and `REDIS_PORT` environment variables)
  - Postgres (set `RDBMS_URI` environment variable)
  - Set: `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` env vars

## Docker

Alternatively there is a `Dockerfile` and `docker-compose.yml`, so rather than installing dependencies (other than [Docker](https://docs.docker.com/install/#supported-platforms)), you can run:

### Docker Compose

    docker-compose up

### Kubernetes
If you'd rather use Kubernetes to Docker Compose, then:
<TODO>

### Docker

If you don't want to use Docker Compose, then assuming you have Redis and Postgresql running independently of Docker, or exposed in Docker through ports, you can then run:

    docker run -e RDBMS_URI="$RDBMS_URI" \
               -e REDIS_HOST="$REDIS_HOST" \
               -e DEFAULT_ADMIN_EMAIL=foo \
               -e DEFAULT_ADMIN_PASSWORD=bar \
               -p 3000:3000 \
               --name "${PWD##*/}" \
               "${PWD##*/}_api"  # Name of the Docker image, the `_api` is suffixed by Docker Compose

Where `RDBMS_URI` and `REDIS_HOST` environment variables are set correctly for your system, in the form:

    export RDBMS_URI='postgres://username:password@hostname:port/database_name'
    export REDIS_HOST='host'

## Compile+run app

    tsc

Then

    node main.js

or with prettified log output:

    npm start

## Deploy

### Azure
Using their hosted Kubernetes-as-a-Service and Postgres-as-a-Service offerings, here is how to set it up:

First, install [`az`](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest), then run:
```
$ az aks install-cli
$ az group create --name calc-rg0 --location australiaeast
$ az aks create --resource-group calc-rg0 --name calc-kube0 --node-count 3 --enable-addons monitoring --generate-ssh-keys
```

You can now confirm that it worked with:
```
$ az aks get-credentials --resource-group calc-rg0 --name calc-kube0
$ kubectl get nodes
$ az aks show --resource-group calc-rg0 --name calc-kube0 --query 'nodeResourceGroup'
```

*Rest of tutorial: TODO*

## License

Licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or <https://www.apache.org/licenses/LICENSE-2.0>)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or <https://opensource.org/licenses/MIT>)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
