import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
export declare class Form {
    private formValues;
    private deferred;
    private validationSubject;
    private subscription;
    private _isValidating;
    private _isSubmitting;
    private _isValid;
    constructor();
    readonly initialize: () => void;
    update(): void;
    dispose(): void;
    readonly isPristine: boolean;
    readonly isDirty: boolean;
    readonly isSubmitting: boolean;
    readonly isValidating: boolean;
    readonly isValid: boolean;
    validateForm(): Promise<boolean>;
    submit<T>(onSubmit: OnSubmitFunction<T>): Promise<T>;
    reset(): void;
}
export declare type OnSubmitFunction<T, F extends any = any> = (form: F) => Promise<T>;
