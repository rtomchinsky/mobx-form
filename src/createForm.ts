import { Form, OnSubmitFunction } from './Form';
import { FormValue } from './FormValue';

import { action, observable, runInAction, reaction } from 'mobx';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/do';                    
import 'rxjs/add/operator/switchMap';

import { map, every, forEach } from 'lodash';
import { Deferred } from './internal/Deferred';

import { Fields } from './Fields';

export function createForm<T extends Fields>(fields: T): Form & {[K in keyof T]: FormValue<any>} {
    const formMetadata = observable({
        isDirty: false,
        isPristine: true,
        isSubmitting: false,
        isValidating: false,
        isValid: false,
    });

    const formFields = observable(fields);

    const validation = {
        deferred: null as Deferred<any> | null,
        subscription: null as Subscription | null,
    }
    const form: Form & {[K in keyof T]: FormValue<any>} = {
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

        update() {
            forEach(formFields, (value) => {
                value.update(form);
            });
        },

        async submit<T>(onSubmit: OnSubmitFunction<T, {[K in keyof T]: FormValue<any>}>): Promise<T> {
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
        
        validateForm(): Promise<boolean> {
            if (validation.deferred == null) {
                validation.deferred = new Deferred();
            }
            sub.next();
            return validation.deferred.promise;
        }, 
        ...(formFields as any)
    }

    reaction(() => map(formFields, it => {
        return {
            value: it.value,
            isTouched: it.isTouched
        }
    }), () => {
        form.validateForm();
        form.update();
    }, {
        fireImmediately: true
    })

    const sub = new Subject();
    validation.subscription = sub.asObservable()
        .do(action(() => formMetadata.isValidating = true))
        .switchMap(() => {
            return Promise.all(map(formFields, it => it.validate(form)))
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