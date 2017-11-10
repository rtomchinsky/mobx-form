import { FormValue } from './FormValue';
export interface Form<F extends Record<string, FormValue<any>>> {
    readonly isTouched: boolean;
    readonly isPristine: boolean;
    readonly isDirty: boolean;
    readonly isSubmitting: boolean;
    readonly isValidating: boolean;
    readonly isValid: boolean;

    readonly fields: F;

    submit<T>(onSubmit: OnSubmitFunction<T>): Promise<T>;
    reset(): void;
    commit(): void;

    each(cb: (value: FormValue<any>, key?: string) => any): void;
}

export type OnSubmitFunction<T, F extends any = any> = (form: F) => Promise<T>