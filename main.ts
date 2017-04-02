import { homedir } from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as redis from 'redis';
import { Collection, Connection } from 'waterline';
import * as waterline_postgres from 'waterline-postgresql';
import { createLogger } from 'bunyan';
import { Server } from 'restify';
import { IModelRoute, populateModelRoutes, uri_to_config } from 'nodejs-utils';
import { IStrapFramework, strapFramework } from 'restify-utils';
import { SampleData } from './test/SampleData';
import { user_mocks } from './test/api/user/user_mocks';

export const package_ = Object.freeze(require('./package'));
export const logger = createLogger({
    name: 'main'
});

process.env['NO_DEBUG'] || logger.info(Object.keys(process.env).sort().map(k => ({[k]: process.env[k]})));

export interface IObjectCtor extends ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}

declare const Object: IObjectCtor;

// Database waterline_config
const db_uri: string = process.env['RDBMS_URI'] || process.env['DATABASE_URL'] || process.env['POSTGRES_URL'];

const db_path = (r => !!r ? r : path.join(homedir(), '.glaucoma_risk_calculator'))(
    process.argv.length > 2 ? process.argv.slice(2).reduce((acc, arg) =>
        ['--dbpath', '-d'].indexOf(acc) > -1 ? acc = arg : null
    ) : path.join(homedir(), '.glaucoma_risk_calculator'));

function init_db_dir(db_type, cb) {
    ['nedb', 'tingo'].indexOf(db_type) > -1 ?
        fs.access(db_path, err => {
            if (!err) return cb();
            fs.mkdir(db_path, e => cb(err));
        }) : cb();
}

/* TODO: Put this all in tiered environment-variable powered .json file */

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
            connection: uri_to_config(db_uri),
            pool: {
                min: 2,
                max: 20
            }
        }
    }
});

// Other config examples:
Object.freeze({
    adapters: {
        tingo: "import * as waterline_tingo from 'sails-tingo'"
    },
    connections: {
        main_db: {
            adapter: 'tingo',
            connection: db_path,
            dbPath: db_path,
            nativeObjectID: false,
            memStore: false
        }
    },
    defaults: {
        migrate: 'safe' // drop, alter, create, safe
    }
});

Object.freeze({
    adapters: {
        nedb: "import * as waterline_nedb from 'waterline-nedb';"
    },
    connections: {
        main_db: {
            adapter: 'nedb',
            connection: db_path,
            dbPath: db_path,
            inMemoryOnly: false
        }
    },
    defaults: {
        migrate: 'safe'
    }
});

export const all_models_and_routes: IModelRoute = populateModelRoutes('.');

export const redis_cursors: { redis: redis.RedisClient } = {
    redis: null
};

export const c: { collections: Collection[], connections: Connection[] } = {collections: [], connections: []};

let _cache = {};

const default_user: string = JSON.stringify(user_mocks.successes[98]);
export const strapFrameworkKwargs: IStrapFramework = Object.freeze(<IStrapFramework>{
    app_name: package_.name,
    models_and_routes: all_models_and_routes,
    logger: logger,
    _cache: _cache,
    package_: package_,
    root: '/api',
    skip_db: false,
    collections: c.collections,
    waterline_config: <any>waterline_config,
    use_redis: true,
    redis_cursors: redis_cursors,
    createSampleData: true,
    SampleData: SampleData,
    sampleDataToCreate: (sampleData: SampleData) => [
        cb => sampleData.unregister(default_user, (err, res) => cb(err, 'removed default user; next: adding')),
        cb => sampleData.registerLogin(default_user, cb),
        cb => sampleData.loadRiskJson((err, res) => cb(err, 'loaded risk-json'))
    ]
});

if (require.main === module) {
    init_db_dir(waterline_config.connections.main_db.adapter, _ =>
        strapFramework(Object.assign({
            start_app: true, callback: (err, _app: Server, _connections: Connection[], _collections: Collection[]) => {
                if (err) throw err;
                c.collections = _collections
            }
        }, strapFrameworkKwargs))
    );
}
