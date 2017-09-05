export interface Form {
    update(): void;
    dispose(): void;

    readonly isPristine: boolean;
    readonly isDirty: boolean;
    readonly isSubmitting: boolean;
    readonly isValidating: boolean;
    readonly isValid: boolean;

    validateForm(): Promise<boolean>;
    submit<T>(onSubmit: OnSubmitFunction<T>): Promise<T>
}

export type OnSubmitFunction<T, F extends any = any> = (form: F) => Promise<T>