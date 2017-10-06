import * as React from 'react';
import { observer } from 'mobx-react';
import { isEmpty, once, get } from 'lodash';

import { FormValue } from './FormValue';

export type WrappedFieldProps<P = {}, T = string> = P & {
    input: {
        onFocus: React.FocusEventHandler<React.FocusEvent<any>>;
        onChange: React.EventHandler<React.ChangeEvent<any>> | any;
        onBlur: React.FocusEventHandler<React.FocusEvent<any>>;
        value: T
    },
    errors?: Array<string>,
}

export type FieldProps<T = string, P extends {} = {}> = {
    formValue: FormValue<T>;
    stringToFormValue?: (value: string) => T,
    component: React.ComponentType<WrappedFieldProps<any, T>>,
    onBlur?: React.FocusEventHandler<React.FocusEvent<any>>;
    onFocus?: React.FocusEventHandler<React.FocusEvent<any>>;
    fieldInputProps?: P;
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

    private touch = once(() => this.props.formValue.isTouched = true);

    handleFocus = (e: React.FocusEvent<any>) => {
        if (this.props.onFocus) {
            this.props.onFocus(e);
        }
    }

    handleBlur = (e: React.FocusEvent<any>) => {
        this.touch();
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    render() {
        const { 
            formValue,
            stringToFormValue,
            component: Component,
            fieldInputProps = {},
            ...rest
        } = this.props;
        const hasError = formValue.isTouched && !isEmpty(formValue.errors);

        if (!formValue.enabled) {
            return null;
        }
        return (
            <Component
                {...rest}
                input={{
                    ...fieldInputProps,
                    onBlur: this.handleBlur,
                    onFocus: this.handleFocus,
                    onChange: this.handleChange,
                    value: formValue.value
                }}
                errors={hasError ? formValue.errors : undefined}
            />
        )
    }
}