import * as url from 'url';
import { series } from 'async';
import { ClientRequest, IncomingMessage, request as http_request, RequestOptions } from 'http';
import { trivial_merge } from 'nodejs-utils';
import { HttpError } from 'restify';
import { AsyncResultCallback } from 'waterline';
import { risk_json } from 'glaucoma-risk-quiz-engine';

export interface ISampleData {
    token: string;
    login(user: string, cb);
    registerLogin(user: string, cb);
    unregister(user: string, cb);
    loadRiskJson(cb);
}

interface callback {
    (res: IncomingMessageF): void;
}

interface cb {
    (err: IncomingMessageF, res?: IncomingMessageF): void;
}

export interface IncomingMessageF extends IncomingMessage {
    func_name: string;
}

function httpF(method: 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'GET' | 'DELETE') {
    return (options: RequestOptions,
            func_name: string,
            body_or_cb: string | callback | cb | AsyncResultCallback<{}>,
            cb?: callback | cb | AsyncResultCallback<{}>): ClientRequest => {
        if (!cb) {
            cb = <callback | cb | AsyncResultCallback<{}>>body_or_cb;
            body_or_cb = null;
        }

        options['method'] = method;

        if (body_or_cb)
            if (!options)
                options = {'headers': {'Content-Length': Buffer.byteLength(<string>body_or_cb)}};
            else if (!options.headers)
                options.headers = {'Content-Length': Buffer.byteLength(<string>body_or_cb)};
            else if (!options.headers['Content-Length'])
                options.headers['Content-Length'] = Buffer.byteLength(<string>body_or_cb);

        const req = http_request(options, (res: IncomingMessageF) => {
            res.func_name = func_name;
            if (!res) return (<cb>cb)(res);
            else if ((res.statusCode / 100 | 0) > 3) return (<cb>cb)(res);
            return (<cb>cb)(null, res);
        });
        //body_or_cb ? req.end(<string>body_or_cb, cb) : req.end();
        body_or_cb && req.write(body_or_cb);
        req.end();

        return req;
    }
}

const httpHEAD = httpF('HEAD'),
    httpGET = httpF('GET'),
    httpPOST = httpF('POST'),
    httpPUT = httpF('PUT'),
    httpPATCH = httpF('PATCH'),
    httpDELETE = httpF('DELETE');

export class SampleData implements ISampleData {
    public token: string;
    private uri: url.Url;

    constructor(uri: string) {
        this.uri = url.parse(uri);
    }

    private mergeOptions(options, body?) {
        return trivial_merge({
            host: this.uri.host === `[::]:${this.uri.port}` ? 'localhost' :
                `${this.uri.host.substr(this.uri.host.lastIndexOf(this.uri.port) + this.uri.port.length)}`,
            port: parseInt(this.uri.port),
            headers: trivial_merge({
                'Content-Type': 'application/json',
                'Content-Length': body ? Buffer.byteLength(body) : 0
            }, this.token ? {'X-Access-Token': this.token} : {})
        }, options)
    }

    login(user: string, cb) {
        httpPOST(
            this.mergeOptions({path: '/api/auth'}),
            'login', user, (err, res) => {
                if (err) return cb(err);
                else if (!res.headers) return cb(new HttpError('HTTP request failed'));
                this.token = res.headers['x-access-token'];
                return cb(err, this.token);
            });
    }

    logout(access_token: string, cb) {
        const options = this.mergeOptions({path: '/api/auth'});
        options.headers['x-access-token'] = access_token || this.token;
        httpDELETE(options, 'logout', (err, res) => {
            if (err) return cb(err);
            else if (!res.headers) return cb(new HttpError('HTTP request failed'));
            delete this.token;
            return cb(err, this.token);
        });
    }

    register(user: string, cb) {
        httpPOST(
            this.mergeOptions({path: '/api/user'}),
            'registerLogin', user, cb
        );
    }

    registerLogin(user: string, cb) {
        series([
            callback => this.register(user, callback),
            callback => this.login(user, callback),
        ], (err, res: Array<IncomingMessageF>) => {
            if (err) return cb(err);
            else if (res[1].headers) this.token = <string>res[1].headers['x-access-token'];
            return cb(err, this.token);
        });
    }

    unregister(user: string, cb) {
        const unregisterUser = (user, callback) => httpDELETE(
            this.mergeOptions({path: '/api/user'}),
            'unregister', user, (error, result) => {
                if (error) return callback(error);
                else if (result.statusCode !== 204)
                    return callback(new Error(`Expected status code of 204 got ${result.statusCode}`));
                return callback(error, result.statusMessage);
            }
        );

        this.token ? unregisterUser(user, cb) : this.login(user, (err, access_token: string) =>
            err ? cb() : unregisterUser(user, cb)
        );
    }

    loadRiskJson(cb) {
        httpPOST(
            this.mergeOptions({path: '/api/risk_stats'}),
            'loadRiskJson', JSON.stringify({
                risk_json: risk_json
            }), cb
        )
    }
}
