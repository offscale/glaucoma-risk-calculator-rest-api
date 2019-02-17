FROM node:10.15.1-alpine as node
ENV REST_API /rest-api
ADD . ${REST_API}
WORKDIR ${REST_API}

ADD https://raw.githubusercontent.com/DrizlyInc/wait-for/master/wait-for /bin/wait_for_it.sh
RUN apk add --no-cache make openssl g++ netcat-openbsd python && \
    chmod +x /bin/wait_for_it.sh && \
    npm i -g npm; npm i -g typings typescript tslint mocha bunyan && \
    rm -rf node_modules; [ -f typings.json ] && typings i; npm i && tsc

CMD npm start

#FROM alpine
#ENV REST_API /rest-api
#ADD . ${REST_API}
#WORKDIR ${REST_API}
#
#COPY --from=0 "$REST_API" "$REST_API"
#COPY --from=0 /usr/local/bin/mocha /usr/local/bin/
#COPY --from=0 /usr/local/bin/tslint /usr/local/bin/
#COPY --from=0 /usr/local/bin/tsc /usr/local/bin/
#COPY --from=0 /usr/local/bin/typings /usr/local/bin/
#COPY --from=0 /usr/local/bin/bunyan /usr/local/bin/
#COPY --from=0 /usr/local/bin/npm /usr/local/bin/
#COPY --from=0 /usr/local/bin/npx /usr/local/bin/
#COPY --from=0 /usr/local/bin/node /usr/local/bin/
#COPY --from=0 /usr/local/lib/node_modules /usr/local/lib/node_modules
#
#CMD npm start
