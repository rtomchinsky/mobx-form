/// <reference types="react" />
import * as React from 'react';
import { FormValue } from './FormValue';
export declare type WrappedFieldProps<P = {}, T = string> = P & {
    input: {
        onFocus: React.FocusEventHandler<any>;
        onChange: React.ChangeEventHandler<any> | any;
        onBlur: React.FocusEventHandler<any>;
        value: T;
    };
    errors?: Array<string>;
    disabled?: boolean;
};
export declare type FieldProps<T = string, P extends {} = {}> = {
    formValue: FormValue<T>;
    stringToFormValue?: (value: string) => T;
    component: React.ComponentType<WrappedFieldProps<any, T>>;
    onBlur?: React.FocusEventHandler<any>;
    onFocus?: React.FocusEventHandler<any>;
    fieldInputProps?: P;
    [index: string]: any;
};
export declare class Field<T = string> extends React.Component<FieldProps<T>> {
    handleChange: (e: React.ChangeEvent<any> | T) => void;
    private touch;
    handleFocus: (e: React.FocusEvent<any>) => void;
    handleBlur: (e: React.FocusEvent<any>) => void;
    render(): JSX.Element;
}
