import { FormValue } from './FormValue';

export type ValidationResult = string | Array<string> | undefined;

export type Validator<T> = {
    (value: T, form: Record<string, FormValue<any>>): ValidationResult | Promise<ValidationResult>
}