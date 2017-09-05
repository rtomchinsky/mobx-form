import * as React from 'react';
import { FormValue } from './FormValue';
import { observer } from 'mobx-react';
import { isEmpty, once, get } from 'lodash';

export type WrappedFieldProps<P = {}, T = string> = P & {
    input: {
        onChange: React.EventHandler<React.ChangeEvent<any>> | any,
        onBlur: React.EventHandler<any>,
        value: T
    },
    errors?: Array<string>,
}

export type FieldProps<T = string> = {
    formValue: FormValue<T>;
    stringToFormValue?: (value: string) => T,
    component: React.ComponentType<WrappedFieldProps<any, T>>,
    [index: string]: any
};

function isEvent(e: any): e is React.ChangeEvent<any> {
    return e.target || e.nativeEvent;
}

@observer
export class Field<T = string> extends React.PureComponent<FieldProps<T>> {
    handleChange = (e: React.ChangeEvent<any> | T) => {
        const { formValue, stringToFormValue } = this.props;
        let value: T;
        if (isEvent(e)) {
            let stringValue: string = get(e.target, 'value') || get(e.nativeEvent, 'data') || get(e.nativeEvent, 'text') || '';
            if (stringToFormValue == null) {
                if (typeof formValue.value !== 'string') {
                    throw new Error('A Field with a non-string FormValue must be provided with stringToFormValue');
                }
                value = stringValue as any as T;
            } else {
                value = stringToFormValue(stringValue);
            }
        } else {
            value = e;
        }
        formValue.value = value;
    }

    handleBlur = once(() => this.props.formValue.isTouched = true)

    render() {
        const { formValue, stringToFormValue, component: Component, ...rest } = this.props;
        const hasError = formValue.isTouched && !isEmpty(formValue.errors);

        if (!formValue.enabled) {
            return null;
        }
        return (
            <Component
                {...rest}
                input={{
                    onBlur: this.handleBlur,
                    onChange: this.handleChange,
                    value: formValue.value
                }}
                errors={hasError ? formValue.errors : undefined}
            />
        )
    }
}