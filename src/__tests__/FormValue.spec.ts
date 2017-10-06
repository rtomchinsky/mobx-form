import test from 'ava';
import { FormValue } from '../FormValue';

test('FormValue is pristine without changes', t => {
    const value = new FormValue({
        initialValue: ''
    });

    t.is(value.value, '');
    t.true(value.isPristine);
    t.false(value.isDirty);
});

test('FormValue is not pristine with changes', t => {
    const value = new FormValue({
        initialValue: ''
    });

    value.value = 'changed';

    t.is(value.value, 'changed');
    t.false(value.isPristine);
    t.true(value.isDirty);
});

test('FormValue accepts changes to isTouched', t => {
    const value = new FormValue({
        initialValue: ''
    });

    t.false(value.isTouched);
    value.isTouched = true;
    t.true(value.isTouched);
});

test('FormValue accepts validation with string result', t => {
    const value = new FormValue({
        initialValue: '',
        validator: (value: string) => value.length === 1 ? undefined : 'Error'
    });

    return value.validate({} as any).then(() => {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 1);
        t.is(value.errors[0], 'Error')

        return value.validate({} as any).then(() => {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        })
    })
})

test('FormValue accepts validation with array of string result', t => {
    const value = new FormValue({
        initialValue: '',
        validator: (value: string) => value.length === 1 ? undefined : [ 'Error', 'Other error' ]
    });

    return value.validate({} as any).then(() => {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 2);
        t.is(value.errors[0], 'Error')
        t.is(value.errors[1], 'Other error')

        return value.validate({} as any).then(() => {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        })
    })
})

test('FormValue accepts validation with Promise result', t => {
    const value = new FormValue({
        initialValue: '',
        validator: (value: string) => Promise.resolve(value.length === 1 ? undefined : [ 'Error', 'Other error' ])
    });

    return value.validate({} as any).then(() => {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 2);
        t.is(value.errors[0], 'Error')
        t.is(value.errors[1], 'Other error')

        return value.validate({} as any).then(() => {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        })
    })
})

test('FormValue accepts an onFormUpdate function', t => {
    const value = new FormValue({
        initialValue: '',
        onFormUpdate: () => {
            t.pass();
        }
    });
    value.update({} as any);
    t.plan(1);
});

test('FormValue can be reset', t => {
    const value = new FormValue({
        initialValue: ''
    });

    value.value = '123';

    t.is(value.value, '123');
    value.reset();
    t.is(value.value, '');
});

test('FormValue is only valid if not validating', t => {
    const value = new FormValue({
        initialValue: '',
        validator: () => {
            return new Promise((resolve) => {
                setTimeout(resolve, 0);
            });
        }
    });

    const promise = value.validate(null!).then(() => {
        t.true(value.isValid);
    });
    t.false(value.isValid);
    return promise;
});