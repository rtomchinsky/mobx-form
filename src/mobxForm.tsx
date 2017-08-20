import * as React from 'react';
import Form, { OnSubmitFunction } from './Form';

export type MobxFormOptions<F extends Form> = {
    form: F,
    onSubmit?: OnSubmitFunction<F>
}
export type MobxFormProps = {
    submit: Function
}
export type MobxFormComponent<P> = React.ComponentType<P & MobxFormProps>;
export default function mobxForm<TInner, TOuter, F extends Form = Form>(options: MobxFormOptions<F>): (Component: MobxFormComponent<TInner>) => React.ComponentType<TOuter> {
    return function(Component: MobxFormComponent<TInner>) {
        const submit = (onSubmit: OnSubmitFunction<F> | undefined = options.onSubmit) => {
            if (options.form.isSubmitting) {
                return;
            }
            if (onSubmit == null) {
                throw new Error(`submit requires either an onSubmit parameter or mobxForm to have been initialized with one`);
            }
            return new Promise((resolve, reject) => {
                let promiseResult: any;
                let error: any;
                onSubmit(options.form)
                    .then(r => promiseResult = r)
                    .catch(e => error = e)
                    .then(() => {
                        (options.form as any)._isSubmitting = false
                        if (error) {
                            return reject(error);
                        } else {
                            return resolve(promiseResult);
                        }
                    })
            });
        }

        return function(props: TOuter) {
            return <Component {...props} submit={submit} />
        }
    }
}