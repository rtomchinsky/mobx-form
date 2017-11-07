import { Validator } from './Validator';
import { Form } from './Form';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/switchMap';
export declare type FormValueOptions<T> = {
    initialValue: T;
    validator?: Validator<T>;
    onFormUpdate?: (this: FormValue<T>, form: Form) => void;
};
export declare class FormValue<T = {}> {
    static isFormValue(t: any): t is FormValue<any>;
    private readonly _initialValue;
    private _value;
    private _errors;
    private _touched;
    private _isValidating;
    enabled: boolean;
    private validator?;
    private onFormUpdate?;
    private deferred;
    private validationSubject;
    constructor(options: FormValueOptions<T>);
    value: T;
    readonly errors: string[];
    isTouched: boolean;
    readonly isDirty: boolean;
    readonly isPristine: boolean;
    readonly isValidating: boolean;
    readonly isValid: boolean;
    disable(): void;
    enable(): void;
    update(form: Form): void;
    reset(): void;
    validate(form: Form): Promise<boolean>;
}
