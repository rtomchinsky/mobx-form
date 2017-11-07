import { Form } from './Form';
import { FormValue } from './FormValue';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import { Fields } from './Fields';
export declare function createForm<T extends Fields>(fields: T): Form & {
    [K in keyof T]: T[K];
};
export declare const createFormCreator: <T extends Record<string, FormValue<any>>>(fields: T) => () => Form & {
    [K in keyof T]: T[K];
};
