import { Form, OnSubmitFunction } from './Form';
import { FormValue, FormValueOptions } from './FormValue';

import { action, observable, runInAction, reaction } from 'mobx';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/do';                    
import 'rxjs/add/operator/switchMap';

import { map, every, forEach, mapValues } from 'lodash';
import { Deferred } from './internal/Deferred';

import { Fields } from './Fields';

export function createForm<T extends Fields>(fields: T): Form<{[K in keyof T]: FormValue<T[K]['initialValue']>}> {
    const formMetadata = observable({
        isDirty: false,
        isPristine: true,
        isSubmitting: false,
        isValidating: false,
        isValid: false,
    });

    let form: any = {
        get isDirty() { return formMetadata.isDirty },
        get isPristine() { return formMetadata.isPristine },
        get isSubmitting() { return formMetadata.isSubmitting },
        get isValidating() { return formMetadata.isValidating },
        get isValid() { return formMetadata.isValid },

        dispose() {
            if (validation.subscription != null) {
                validation.subscription.unsubscribe();
                validation.subscription = null;
            }
        },

        async submit<T>(onSubmit: OnSubmitFunction<T, {[K in keyof T]: FormValue<any>}>): Promise<T> {
            forEach(formFields, action((it: FormValue<any>) => {
                it.isTouched = true;
            }));
            if (formMetadata.isSubmitting) {
                return Promise.reject('submitting');
            } else if (!formMetadata.isValid) {
                return Promise.reject('invalid');
            } else {
                formMetadata.isSubmitting = true;
                try {
                    return await onSubmit(form);
                } finally {
                    runInAction(() => {
                        formMetadata.isSubmitting = false;
                    });  
                }
            }
        },
    };

    const formFields = observable(mapValues(fields, (options: FormValueOptions<any>) => {
        return new FormValue(form, options);
    }));
    
    form.fields = formFields;
    forEach(formFields, field => (field as any).initialize());

    const validation = {
        deferred: null as Deferred<any> | null,
        subscription: null as Subscription | null,
    }

    const sub = new Subject();    
    
    function validateForm(): Promise<boolean> {
        if (validation.deferred == null) {
            validation.deferred = new Deferred();
        }
        sub.next();
        return validation.deferred.promise;
    }

    reaction(() => map(formFields, it => {
        return {
            value: it.value,
            isTouched: it.isTouched
        }
    }), () => {
        validateForm();
    }, {
        fireImmediately: true
    })

    validation.subscription = sub.asObservable()
        .do(action(() => formMetadata.isValidating = true))
        .switchMap(() => {
            return Promise.all(map(formFields, it => it.validate()))
                .then(action((results: Array<boolean>) => {
                    const result = every(results);
                    formMetadata.isValid = result;
                    return true;
                }), (reason) => {
                    console.error(reason);
                    return false;
                })
        })
        .subscribe((result) => {
            validation.deferred!.resolve(result);
            validation.deferred = null
        })

    return form;
}
export const createFormCreator = <T extends Fields>(fields: T) => () => createForm(fields);
