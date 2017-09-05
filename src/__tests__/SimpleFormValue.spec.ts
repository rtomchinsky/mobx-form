import test from 'ava';
import { SimpleFormValue } from '../SimpleFormValue';
import { FormValue } from '../FormValue';

test('SimpleFormValue is a FormValue', t => {
    const value = new SimpleFormValue('');
    t.true(value instanceof FormValue);
});

test('SimpleFormValue accepts validators as vararg', async t => {
    const value = new SimpleFormValue('',
        (v) => v.length === 1 ? undefined : 'Error1',
        (v) => v.length === 2 ? undefined : 'Error2',
    );
    
    value.value = '1';
    await value.validate({} as any);
    t.is(value.errors.length, 1);
    t.is(value.errors[0], 'Error2');

    value.value = '22';
    await value.validate({} as any);
    t.is(value.errors.length, 1);
    t.is(value.errors[0], 'Error1');

    value.value = '333';
    await value.validate({} as any);
    t.is(value.errors.length, 2);
    t.is(value.errors[0], 'Error1');
    t.is(value.errors[1], 'Error2');    
});