import test from 'ava';
import { FormValue } from '../FormValue';
import { reaction } from 'mobx';

test('FormValue is pristine without changes', t => {
    const value = new FormValue(null!, {
        initialValue: ''
    });

    t.is(value.value, '');
    t.true(value.isPristine);
    t.false(value.isDirty);
});

test('FormValue is not pristine with changes', t => {
    const value = new FormValue(null!, {
        initialValue: ''
    });

    value.value = 'changed';

    t.is(value.value, 'changed');
    t.false(value.isPristine);
    t.true(value.isDirty);
});

test('FormValue accepts changes to isTouched', t => {
    const value = new FormValue(null!, {
        initialValue: ''
    });

    t.false(value.isTouched);
    value.isTouched = true;
    t.true(value.isTouched);
});

test('FormValue accepts validation with string result', t => {
    const value = new FormValue(null!, {
        initialValue: '',
        validator: (value: string) => value.length === 1 ? undefined : 'Error'
    });

    return value.validate(/*  */).then(() => {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 1);
        t.is(value.errors[0], 'Error')

        return value.validate(/*  */).then(() => {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        })
    })
})

test('FormValue accepts validation with array of string result', t => {
    const value = new FormValue(null!, {
        initialValue: '',
        validator: (value: string) => value.length === 1 ? undefined : [ 'Error', 'Other error' ]
    });

    return value.validate().then(() => {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 2);
        t.is(value.errors[0], 'Error')
        t.is(value.errors[1], 'Other error')

        return value.validate().then(() => {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        })
    })
})

test('FormValue accepts validation with Promise result', t => {
    const value = new FormValue(null!, {
        initialValue: '',
        validator: (value: string) => Promise.resolve(value.length === 1 ? undefined : [ 'Error', 'Other error' ])
    });

    return value.validate().then(() => {
        t.false(value.isValid);
        value.value = '1';
        t.is(value.errors.length, 2);
        t.is(value.errors[0], 'Error')
        t.is(value.errors[1], 'Other error')

        return value.validate().then(() => {
            t.true(value.isValid);
            t.is(value.errors.length, 0);
        })
    })
})

test('FormValue accepts a reaction function', t => {
    const value: FormValue<string> = new FormValue(null!, {
        initialValue: '',
        reaction: () => {
            return reaction(() => value.value, (value) => {
                t.is(value, '1');
            })
        },
    });
    (value as any).initialize();
    value.value = '1';
    t.plan(1);
});

test('FormValue can be reset', t => {
    const value = new FormValue(null!, {
        initialValue: ''
    });

    value.value = '123';

    t.is(value.value, '123');
    value.reset();
    t.is(value.value, '');
});

test('FormValue is only valid if not validating', t => {
    const value = new FormValue(null!, {
        initialValue: '',
        validator: () => new Promise((resolve) => {
            setTimeout(resolve, 0);
        }),
    });

    const promise = value.validate().then(() => {
        t.true(value.isValid);
    });
    t.false(value.isValid);
    return promise;
});

test('FormValue#commit updates the intial value to the current value', t => {
    const value = new FormValue(null!, {
        initialValue: '',
        validator: () => new Promise((resolve) => {
            setTimeout(resolve, 0);
        }),
    });
    value.value = '123';
    t.false(value.isPristine);
    value.commit();
    t.true(value.isPristine);
});