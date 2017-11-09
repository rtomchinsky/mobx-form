import { Form } from './Form';
import { FormValue, FormValueOptions } from './FormValue';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import { Fields } from './Fields';
export declare function createForm<T extends Fields>(fields: T): Form<{
    [K in keyof T]: FormValue<T[K]['initialValue']>;
}>;
export declare const createFormCreator: <T extends Record<string, FormValueOptions<any>>>(fields: T) => () => Form<{
    [K in keyof T]: FormValue<T[K]["initialValue"]>;
}>;
