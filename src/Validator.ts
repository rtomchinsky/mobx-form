import Form from './Form';

export type ValidationResult = string | Array<string> | undefined;

export default interface Validator<T> {
    (value: T, form: Form): ValidationResult | Promise<ValidationResult>
}