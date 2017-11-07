import { FormValue } from './FormValue';
import { Validator } from './Validator';
export declare class SimpleFormValue<T> extends FormValue<T> {
    constructor(initialValue: T, ...validators: Array<Validator<T>>);
}
