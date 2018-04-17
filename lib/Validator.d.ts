import { Form } from './Form';
export declare type ValidationResult = string | Array<string> | undefined;
export interface Validator<T, F extends Form = Form> {
    (value: T, form: F): ValidationResult | Promise<ValidationResult>;
}
