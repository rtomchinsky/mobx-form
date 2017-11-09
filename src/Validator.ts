import { Form } from './Form';

export type ValidationResult = string | Array<string> | undefined;

export interface Validator<T> {
    (value: T, form: Form<any>): ValidationResult | Promise<ValidationResult>
}