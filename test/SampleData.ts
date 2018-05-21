import { series } from 'async';
import { ClientRequest, IncomingMessage, request as http_request, RequestOptions } from 'http';
import { request as https_request } from 'https';
import { IncomingMessageError, trivial_merge } from 'nodejs-utils';
import { HttpError } from 'restify-errors';
import * as url from 'url';
import { AsyncResultCallback, Connection, Query } from 'waterline';
import { fmtError } from 'custom-restify-errors';
import { IRiskJson } from 'glaucoma-risk-quiz-engine';

import { _orms_out } from '../config';
import { TCallback } from './shared_types';

/* tslint:disable:no-var-requires */
export const risk_json: IRiskJson = require('../node_modules/glaucoma-risk-calculator-engine/risk');

export interface ISampleData {
    token: string;

    login(user: string, callback: TCallback<HttpError, string>);

    registerLogin(user: string, callback: TCallback<Error | IncomingMessageError | IncomingMessageF, string>);

    unregister(user: string, callback: TCallback<HttpError, string>);

    loadRiskJson(callback);
}

type Callback = (res: IncomingMessageF) => void;
type Cb = (err: IncomingMessageF, res?: IncomingMessageF) => void;

export interface IncomingMessageF extends IncomingMessage {
    func_name: string;
}

type THttpMethod = 'POST' | 'PUT' | 'PATCH' | 'HEAD' | 'GET' | 'DELETE';

type THttp = (options: RequestOptions,
              func_name: string,
              body_or_cb: string | Callback | Cb | AsyncResultCallback<{}>,
              callback?: Callback | Cb | AsyncResultCallback<{}>) => ClientRequest;

export const httpRequest = <T>(options: RequestOptions, payload?): Promise<T> => {
    return new Promise((resolve, reject) => {
        let protocol_method = http_request;

        if (payload != null && (options.headers == null || !Object.keys(options.headers).length
            || options.headers['Content-Length'] == null))
            options = { headers: { 'Content-Length': Buffer.byteLength(payload) } };

        const sw = 'https://';
        if (options.host.startsWith(sw)) {
            options.host = options.host.slice(sw.length);
            protocol_method = https_request;
        }

        const req = protocol_method(options, res => {
            const body = [];
            res.on('data', chunk => body.push(chunk));
            // resolve on end
            res.on('end', () => {
                try {
                    const d = Buffer.concat(body).toString();

                    /* tslint:disable:no-bitwise */
                    if ((res.statusCode / 100 | 0) > 3) {
                        res['text'] = res.method = d; // hack
                        return reject(fmtError(res));
                    }
                    resolve(JSON.parse(d));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        /* tslint:disable:no-unused-expression */
        payload && req.write(payload);

        req.end();
    });
};

const httpF = (method: THttpMethod): THttp => {
    return (options: RequestOptions,
            func_name: string,
            body_or_cb: string | Callback | Cb | AsyncResultCallback<{}>,
            callback?: Callback | Cb | AsyncResultCallback<{}>): ClientRequest => {
        if (callback == null) {
            callback = body_or_cb as Callback | Cb | AsyncResultCallback<{}>;
            body_or_cb = null;
        }

        options['method'] = method;

        let protocol_method = http_request;

        if (body_or_cb != null)
            if (options == null)
                options = { headers: { 'Content-Length': Buffer.byteLength(body_or_cb as string) } };
            else {
                const sw = 'https://';
                if (options.host.startsWith(sw)) {
                    options.host = options.host.slice(sw.length);
                    protocol_method = https_request;
                }

                if (options.headers == null)
                    options.headers = { 'Content-Length': Buffer.byteLength(body_or_cb as string) };
                else if (options.headers['Content-Length'] == null)
                    options.headers['Content-Length'] = Buffer.byteLength(body_or_cb as string);
            }

        const req = protocol_method(options, (res: IncomingMessageF) => {
            res.func_name = func_name;
            if (res == null) return (callback as Cb)(res);
            /* tslint:disable:no-bitwise */
            else if ((res.statusCode / 100 | 0) > 3) return (callback as Cb)(res);
            return (callback as Cb)(null, res);
        });
        // body_or_cb ? req.end(<string>body_or_cb, cb) : req.end();
        /* tslint:disable:no-unused-expression */
        body_or_cb && req.write(body_or_cb);
        req.end();

        return req;
    };
};

export const http: {[method: string]: THttp} = ([
    'HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
] as THttpMethod[]).reduce((obj: {}, key: THttpMethod) =>
    Object.assign(obj, { [key.toLowerCase()]: httpF(key) }), {}
);

const httpHEAD = httpF('HEAD');
const httpGET = httpF('GET');
const httpPOST = httpF('POST');
const httpPUT = httpF('PUT');
const httpPATCH = httpF('PATCH');
const httpDELETE = httpF('DELETE');

const zip = (a0: any[], a1: any[]) => a0.map((x, i) => [x, a1[i]]);

export class SampleData implements ISampleData {
    public token: string;
    private uri: url.Url;

    constructor(uri: string, connection: Connection[], collections: Query[]) {
        this.uri = url.parse(uri);
        _orms_out.orms_out.waterline.connection = connection;
        _orms_out.orms_out.waterline.collections = collections;
    }

    public login(user: string, callback: TCallback<HttpError, string>) {
        httpPOST(
            this.mergeOptions({ path: '/api/auth' }),
            'login', user, (err, res) => {
                if (err != null) return callback(err);
                else if (res.headers == null) return callback(new HttpError('HTTP request failed'));
                this.token = res.headers['x-access-token'];
                return callback(err, this.token);
            });
    }

    public logout(access_token: string, callback: TCallback<HttpError, string>) {
        const options = this.mergeOptions({ path: '/api/auth' });
        options.headers['x-access-token'] = access_token || this.token;
        httpDELETE(options, 'logout', (err, res) => {
            if (err != null) return callback(err);
            else if (res.headers == null) return callback(new HttpError('HTTP request failed'));
            delete this.token;
            return callback(err, this.token);
        });
    }

    public register(user: string, callback: TCallback<Error | IncomingMessageError, IncomingMessageF>) {
        httpPOST(
            this.mergeOptions({ path: '/api/user' }),
            'registerLogin', user, callback
        );
    }

    public registerLogin(user: string, callback: TCallback<Error | IncomingMessageError | IncomingMessageF, string>) {
        series([
            callb => this.register(user, callb),
            callb => this.login(user, callb as any),
        ], (err: Error, res: IncomingMessageF[]) => {
            if (err != null) return callback(err);
            else if (res[1].headers != null) this.token = res[1].headers['x-access-token'] as string;
            return callback(err, this.token);
        });
    }

    public unregister(user: string, callback) {
        const unregisterUser = (_user: string, callb) => httpDELETE(
            this.mergeOptions({ path: '/api/user' }),
            'unregister', _user, (error, result) => {
                if (error != null) return callb(error);
                else if (result.statusCode !== 204)
                    return callb(new Error(`Expected status code of 204 got ${result.statusCode}`));
                return callb(error, result.statusMessage);
            }
        );

        this.token ? unregisterUser(user, callback) : this.login(user, (err, access_token: string) =>
            err ? callback() : unregisterUser(user, callback)
        );
    }

    public loadRiskJson(cb) {
        httpPOST(
            this.mergeOptions({ path: '/api/risk_stats' }),
            'loadRiskJson', JSON.stringify({
                risk_json
            }), cb
        );
    }

    private mergeOptions(options, body?) {
        return trivial_merge({
            host: this.uri.host === `[::]:${this.uri.port}` ? 'localhost' :
                `${this.uri.host.substr(this.uri.host.lastIndexOf(this.uri.port) + this.uri.port.length)}`,
            port: parseInt(this.uri.port, 10),
            headers: trivial_merge({
                'Content-Type': 'application/json',
                'Content-Length': body ? Buffer.byteLength(body) : 0
            }, this.token ? { 'X-Access-Token': this.token } : {})
        }, options);
    }
}
