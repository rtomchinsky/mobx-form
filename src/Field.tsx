import * as React from 'react';
import FormValue from './FormValue';
import { observer } from 'mobx-react';
import { isEmpty, once, get } from 'lodash';

export type WrappedFieldProps = {
    input: {
        onChange: React.EventHandler<React.ChangeEvent<any>> | any,
        onBlur: React.EventHandler<any>,
        value: string
    },
    errors?: Array<string>,
    [index: string]: any
}

export type FieldProps<T> = {
    formValue: FormValue<T>;
    formValueToString?: (formValue: T) => string;
    stringToFormValue?: (value: string) => T,
    component: React.ComponentType<WrappedFieldProps>,
    [index: string]: any
};

function isEvent(e: any): e is React.ChangeEvent<any> {
    return e.target || e.nativeEvent;
}

@observer
export class Field<T = string> extends React.PureComponent<FieldProps<T>> {
    handleChange = (e: React.ChangeEvent<any> | T) => {
        const { formValue, formValueToString, stringToFormValue } = this.props;
        let value: string;
        if (isEvent(e)) {
            value = get(e.target, 'value') || get(e.nativeEvent, 'data') || get(e.nativeEvent, 'text') || '';
        } else {
            value = formValueToString ? formValueToString(e) : e.toString();
        }
        formValue.value = stringToFormValue ? stringToFormValue(value) : value.toString() as any;
    }

    handleBlur = once(() => this.props.formValue.isTouched = true)

    render() {
        const { formValue, formValueToString, stringToFormValue, component: Component, ...rest } = this.props;
        const hasError = formValue.isTouched && !isEmpty(formValue.errors);
        return (
            <Component
                {...rest}
                input={{
                    onBlur: this.handleBlur,
                    onChange: this.handleChange,
                    value: formValueToString ? formValueToString(formValue.value) : formValue.value.toString()
                }}
                errors={hasError ? formValue.errors : undefined}
            />
        )
    }
}