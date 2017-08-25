import * as React from 'react';
import FormValue from './FormValue';
import { observer } from 'mobx-react';
import { isEmpty, once } from 'lodash';

export type WrappedFieldprops = {
    input: {
        onChange: React.EventHandler<React.ChangeEvent<any>>,
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
    component: React.ComponentType<WrappedFieldprops>,
    [index: string]: any
};

@observer
export class Field<T = string> extends React.PureComponent<FieldProps<T>> {
    handleChange = (e: React.ChangeEvent<any>) => {
        const { formValue, stringToFormValue } = this.props;
        formValue.value = stringToFormValue ? stringToFormValue(e.target.value) : e.target.value.toString()
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