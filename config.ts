import * as Logger from 'bunyan';
import { WaterlineError } from 'custom-restify-errors';
import { IOrmMwConfig, IOrmsOut, RequestHandler } from 'orm-mw';
import { Server } from 'restify';
import { IRoutesMergerConfig } from 'routes-merger';
import { ConfigOptions, WLError } from 'waterline';
import * as waterline_postgres from 'waterline-postgresql';

/* TODO: Put this all in tiered environment-variable powered .json file */
export const db_uri: string = process.env['RDBMS_URI'] || process.env['DATABASE_URL'] || process.env['POSTGRES_URL'];

// Database waterline_config
export const waterline_config: ConfigOptions = Object.freeze({
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
} as any as ConfigOptions);

// ONLY USE `_orms_out` FOR TESTS!
export const _orms_out: {orms_out: IOrmsOut} = { orms_out: undefined };

export const getOrmMwConfig = (models: Map<string, any>, logger: Logger,
                               cb: (err: Error,
                                    with_app?: IRoutesMergerConfig['with_app'],
                                    orms_out?: IOrmsOut) => void): IOrmMwConfig => ({
    models, logger,
    orms_in: {
        redis: {
            skip: false,
            config: {
                port: parseInt(process.env.REDIS_PORT || 6379 as any, 10),
                host: process.env.REDIS_HOST || 'localhost'
            }
        },
        sequelize: {
            skip: true,
        },
        typeorm: {
            skip: true
        },
        waterline: {
            skip: false,
            config: waterline_config
        }
    },
    callback: (e: Error, mw: RequestHandler, orms_out: IOrmsOut) => {
        if (e != null) {
            if (cb != null) return cb(e);
            throw e;
        }
        _orms_out.orms_out = orms_out;
        return cb(void 0, (_app: Server) => {
            _app.use(mw);
            _app.on('WLError', (req, res, err: WLError, next) =>
                next(new WaterlineError(err))
            );
            return _app;
        }, orms_out);
    }
});
