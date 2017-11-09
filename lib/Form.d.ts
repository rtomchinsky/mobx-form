import { FormValue } from './FormValue';
export interface Form<F extends Record<string, FormValue<any>>> {
    isPristine: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
    isValidating: boolean;
    isValid: boolean;
    fields: F;
    submit<T>(onSubmit: OnSubmitFunction<T>): Promise<T>;
    reset(): void;
    each(cb: (values: F) => void): void;
}
export declare type OnSubmitFunction<T, F extends any = any> = (form: F) => Promise<T>;
