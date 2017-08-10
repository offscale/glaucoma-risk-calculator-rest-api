import * as Redis from 'ioredis';
import { Collection, Connection, Query } from 'waterline';
import * as waterline_postgres from 'waterline-postgresql';
import { createLogger } from 'bunyan';
import { Server } from 'restify';
import { waterfall } from 'async';
import { get_models_routes, IModelRoute, populateModelRoutes } from 'nodejs-utils';
import { IStrapFramework, strapFramework } from 'restify-orm-framework';

import { risk_json } from './test/SampleData';
import { user_mocks } from './test/api/user/user_mocks';
import { AuthTestSDK } from './test/api/auth/auth_test_sdk';
import { IUserBase } from './api/user/models.d';
import { RiskStatsTestSDK } from './test/api/risk_stats/risk_stats_test_sdk';

/* tslint:disable:no-var-requires */
export const package_ = Object.freeze(require('./package'));
export const logger = createLogger({
    name: 'main'
});

/* tslint:disable:no-unused-expression */
process.env['NO_DEBUG'] || logger.info(Object.keys(process.env).sort().map(k => ({ [k]: process.env[k] })));

export interface IObjectCtor extends ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

declare const Object: IObjectCtor;

/* TODO: Put this all in tiered environment-variable powered .json file */
const db_uri: string = process.env['RDBMS_URI'] || process.env['DATABASE_URL'] || process.env['POSTGRES_URL'];
// Database waterline_config
export const waterline_config = Object.freeze({
    adapters: {
        url: db_uri,
        postgres: waterline_postgres
    },
    defaults: {
        migrate: 'create'
    },
    connections: {
        main_db: {
            adapter: 'postgres',
            connection: db_uri,
            pool: {
                min: 2,
                max: 20
            }
        }
    }
});

export const all_models_and_routes: Map<string, any> = populateModelRoutes(__dirname);
export const all_models_and_routes_as_mr: IModelRoute = get_models_routes(all_models_and_routes);

export const redis_cursors: {redis: Redis.Redis} = { redis: null };

export const c: {collections: Query[], connections: Connection[]} = { collections: [], connections: [] };

function raise(e: Error) {
    throw e;
}

const _cache = {};
export const cache = {};
const default_user: IUserBase = user_mocks.successes[98];
export const strapFrameworkKwargs: IStrapFramework = Object.freeze({
    app_name: package_.name,
    models_and_routes: all_models_and_routes_as_mr,
    logger,
    _cache,
    package_,
    root: '/api',
    skip_waterline: false,
    skip_typeorm: true,
    collections: c.collections,
    waterline_config: waterline_config as any,
    skip_redis: false,
    app_logging: false,
    redis_cursors,
    onServerStart: (uri: string, connections: Connection[], collections: Query[],
                    connection, _app: Server, next) => {
        c.connections = connections;
        c.collections = collections;
        const authSdk = new AuthTestSDK(_app);
        const riskStatsSdk = new RiskStatsTestSDK(_app);

        waterfall([
                cb => authSdk.unregister_all([default_user],
                    (err, res) => cb(err != null && err.message != null && err.message.indexOf('NotFoundError') === -1 ?
                        err : void 0, 'removed default user; next: adding')
                ),
                (msg: string, cb) => logger.info(msg) || authSdk.register_login(default_user, cb),
                (access_token, cb) => riskStatsSdk.create(access_token, { risk_json, createdAt: new Date() },
                    (err, res) => err == null && logger.info('loaded risk-json') || cb(err)),
                cb => logger.info(`${_app.name} (still) listening from ${_app.url}`) || cb()
            ],
            (e: Error) => e == null ? next(void 0, _app, connections, collections) : raise(e)
        )
        ;
    }
} as IStrapFramework);

if (require.main === module)
    strapFramework(Object.assign({
        skip_start_app: false,
        callback: (err, _app: Server, _connections: Connection[], _collections: Collection[]) => {
                if (err != null) throw err;
                c.connections = _connections;
                c.collections = _collections;
            }
        }, strapFrameworkKwargs)
    );
