import { observable, reaction, computed, action } from 'mobx';
import { map, mapValues, forEach, defer, reduce, every } from 'lodash';

import FormValue from './FormValue';

export default class Form {
    private initialValues: {[index: string]: any};
    private formValues: Record<string, FormValue>;
    private aboutToValidate: Promise<boolean> | null = null;
    @observable private _isSubmitting: boolean = false;
    @observable private _isValid: boolean = false;

    constructor() {
        // We need to defer this because our fields won't be initialized yet
        defer(() => {
            this.formValues = reduce(this as {}, (acc, value, key) => {
                if (FormValue.isFormValue(value)) {
                    acc[key] = value;
                }
                return acc;
            }, ({} as any));
            this.initialValues = mapValues(this.formValues, it => it.value)
            
            forEach(this.formValues, it => reaction(() => it.value, () => this.validateForm()));
            this.validateForm();
        });
    }

    validateForm(): Promise<boolean> {
        if (this.aboutToValidate == null) {
            this.aboutToValidate = Promise.all(map(this.formValues, it => it.validate(this)))
                .then((results) => every(results))
                .then(action((result: boolean) => {
                    this._isValid = result;
                    return result;
                }))
        }
        return this.aboutToValidate as Promise<boolean>
    }

    @computed get isPristine(): boolean {
        return every(this.formValues, (it, key) => it.value === this.initialValues[key]);
    }

    @computed get isDirty(): boolean {
        return every(this.formValues, (it, key) => it.value !== this.initialValues[key]);
    }

    @computed get isSubmitting(): boolean {
        return this._isSubmitting;
    }

    @computed get isValid(): boolean {
        return this._isValid;
    }

    submit(onSubmit: OnSubmitFunction) {
        if (this._isSubmitting) {
            return;
        } else {
            this._isSubmitting = true;
            onSubmit(this);
        }
    }
}

export type OnSubmitFunction<F extends Form = Form> = (form: F) => Promise<any>