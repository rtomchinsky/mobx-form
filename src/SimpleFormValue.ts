import { flatMap, isArray } from 'lodash';

import { FormValue } from './FormValue';
import { Validator, ValidationResult } from './Validator';

export class SimpleFormValue<T> extends FormValue<T> {
    constructor(initialValue: T, ...validators: Array<Validator<T>>) {
        super({
            initialValue,
            validator: (value: T, form: any) => {
                let results = validators.map(it => Promise.resolve(it(value, form)));
                return Promise.all(results).then((results: Array<ValidationResult>) => {
                    const meaningful = results.filter(it => it != null) as Array<string | Array<string>>;
                    const flattened = flatMap(meaningful, (it => isArray(it) ? it : [ it ]));
                    return flattened;
                })
            }
        })
    }
}