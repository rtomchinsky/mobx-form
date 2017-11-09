import { Form } from './Form';
export declare type ValidationResult = string | Array<string> | undefined;
export interface Validator<T> {
    (value: T, form: Form<any>): ValidationResult | Promise<ValidationResult>;
}
