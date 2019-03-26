glaucoma-risk-calculator REST API
=================================

REST API backend written on Node.JS in TypeScript with restify and waterline


## Install prerequisites

  0. node & npm (tested with node v10.15.3 and npm v6.9.0)
  1. Run: `npm install -g typescript typings bunyan`
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
               "${PWD##*/}"

Where `RDBMS_URI` and `REDIS_HOST` environment variables are set correctly for your system.

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
```

