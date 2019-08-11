import * as restify from 'restify';
export declare const create: (app: restify.Server, namespace?: string) => void;
declare type DeepReadonly<T> = T extends any[] ? DeepReadonlyArray<T[number]> : T extends object ? DeepReadonlyObject<T> : T;
interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {
}
declare type DeepReadonlyObject<T> = T & {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
export declare const statistical_functions: DeepReadonlyArray<[string, string]>;
export declare const getAll: (app: restify.Server, namespace?: string) => void;
export {};
