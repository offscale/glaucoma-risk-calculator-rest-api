import * as path from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';

import { waterfall } from 'async';
import { createLogger } from 'bunyan';
import * as restify from 'restify';
import { Server } from 'restify';
import * as morgan from 'morgan';

import { IRoutesMergerConfig, routesMerger, TApp } from 'routes-merger';
import { get_models_routes, IModelRoute, populateModelRoutes, raise } from 'nodejs-utils';
import { IormMwConfig, IOrmsOut, ormMw } from 'orm-mw';

import { AuthTestSDK } from './test/api/auth/auth_test_sdk';
import { RiskStatsTestSDK } from './test/api/risk_stats/risk_stats_test_sdk';
import { risk_json } from './test/SampleData';
import { IUserBase } from './api/user/models.d';
import { AccessToken } from './api/auth/models';
import * as config from './config';
import { getOrmMwConfig } from './config';


/* tslint:disable:no-var-requires */
export const package_ = Object.freeze(require('./package'));
export const logger = createLogger({ name: 'main' });

/* tslint:disable:no-unused-expression */
process.env['NO_DEBUG'] || logger.info(Object.keys(process.env).sort().map(k => ({ [k]: process.env[k] })));

const parent = process.env.WORKING_DIR || path.join(homedir(), 'glaucoma-risk-calculator-data');
if (!existsSync(parent)) mkdirSync(parent);

export const all_models_and_routes: Map<string, any> = populateModelRoutes(__dirname);
export const all_models_and_routes_as_mr: IModelRoute = get_models_routes(all_models_and_routes);

export const setupOrmApp = (models_and_routes: Map<string, any>,
                            mergeOrmMw: Partial<IormMwConfig>,
                            mergeRoutesConfig: Partial<IRoutesMergerConfig>,
                            callback: (err: Error, app?: TApp, orms_out?: IOrmsOut) => void) => waterfall([
    cb => ormMw(Object.assign({}, getOrmMwConfig(models_and_routes, logger, cb), mergeOrmMw)),
    (with_app: IRoutesMergerConfig['with_app'], orms_out: IOrmsOut, cb) =>
        routesMerger(Object.assign({
            logger,
            with_app: (app: Server) => {
                // create a write stream (in append mode)
                const accessLogStream = createWriteStream(path.join(parent, 'access.log'), { flags: 'a' });
                const bodyLogStream = createWriteStream(path.join(parent, 'body.log'), { flags: 'a' });

                app.use(restify.plugins.queryParser());
                app.use(restify.plugins.bodyParser());

                app.use(((req, res, next) => {
                    if (req.body && req.contentType() === 'application/json') {
                        bodyLogStream.write('`');
                        bodyLogStream.write(new Date().toISOString());
                        /*bodyLogStream.write('`\t`');
                        bodyLogStream.write(req.);*/
                        bodyLogStream.write('`\t`');
                        bodyLogStream.write(req.method);
                        bodyLogStream.write('`\t`');
                        bodyLogStream.write(req.getUrl().path);
                        bodyLogStream.write('`\t`');
                        bodyLogStream.write(JSON.stringify(req.body));
                        bodyLogStream.write('`\n');
                    }
                    return next();
                }));
                app.use(morgan('combined', { stream: accessLogStream }));

                return with_app(app);
            },
            routes: models_and_routes,
            server_type: 'restify',
            package_: { version: package_.version },
            app_name: package_.name,
            root: '/api',
            skip_app_version_routes: false,
            skip_start_app: false,
            skip_app_logging: false,
            skip_use: true,
            listen_port: process.env.PORT || 3000,
            onServerStart: (uri: string, app: Server, next) => {
                AccessToken.reset();

                const authSdk = new AuthTestSDK(app);
                const riskStatsSdk = new RiskStatsTestSDK(app);
                const admin_user: IUserBase = {
                    email: process.env.DEFAULT_ADMIN_EMAIL || 'foo',
                    password: process.env.DEFAULT_ADMIN_PASSWORD || 'bar'
                };

                const log_prev = (msg: string, callb) => logger.info(msg) as any || callb(void 0);

                waterfall([
                        callb => authSdk.unregister_all([admin_user], (err: Error & {status: number}) =>
                            callb(err != null && err.status !== 404 ? err : void 0,
                                'removed default user; next: adding')),
                        log_prev,
                        callb => authSdk.register_login(admin_user, callb),
                        (access_token, callb) => riskStatsSdk.create(access_token, { risk_json, createdAt: new Date() },
                            err => callb(err, 'loaded risk-json')),
                        log_prev,
                        callb => logger.info(`${app.name} listening from ${app.url}`) as any || callb(void 0)
                    ], (e: Error) => e == null ? next(void 0, app, orms_out) : raise(e)
                );
            },
            callback: (err: Error, app: TApp) => cb(err, app, orms_out)
        }, mergeRoutesConfig))
], callback);

if (require.main === module)
    setupOrmApp(all_models_and_routes, { logger }, { logger, skip_start_app: false },
        (err: Error, app: TApp, orms_out: IOrmsOut) => {
            if (err != null) throw err;
            config._orms_out.orms_out = orms_out;
        }
    );
