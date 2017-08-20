import Form from './Form';

export default interface Validator<T> {
    (value: T, form: Form): string | Array<string> | undefined
}