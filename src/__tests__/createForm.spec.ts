import test from 'ava';
import { createForm } from '../createForm';
import { reaction } from 'mobx';
import { Form } from '../Form';

test('#createForm accepts different types of values', (t) => {
    const form = createForm({
        a: { initialValue: '' },
        b: { initialValue: 0 },
    });

    t.is(form.fields.a.value, '');
    t.is(form.fields.b.value, 0);
});

test('#createForm creates a form that validates', (t) => {
    const form = createForm({
        a: {
            initialValue: '',
            validator: (it) => {
                if (it !== 'valid') {
                    return 'err';
                } else {
                    return;
                }
            }
        }
    });

    t.plan(2);
    t.false(form.isValid);
    form.fields.a.value = 'valid';

    // Validation is asynchronous
    return new Promise((resolve) => {
        setTimeout(() => resolve(t.true(form.isValid)));
    });
});

test('#createForm creates a form that triggers reactions', (t) => {
    const form = createForm({
        a: {
            initialValue: '',
            reaction: (f: Form<any>) => {
                return reaction(() => f.fields.b.value, (v) => {
                    f.fields.a.value = v;
                }, true);
            }
        },
        b: {
            initialValue: '1',
        }
    });



    // Validation is asynchronous
    return new Promise((resolve) => {
        setTimeout(() => resolve(t.is(form.fields.a.value, '1')));
    });
});

test('#createForm can commit all form values', (t) => {
    const form = createForm({
        a: {
            initialValue: '',
            reaction: (f: Form<any>) => {
                return reaction(() => f.fields.b.value, (v) => {
                    f.fields.a.value = v;
                }, true);
            }
        },
        b: {
            initialValue: '1',
        }
    });

    form.fields.a.value = '123';
    form.fields.b.value = '123';

    t.false(form.isPristine);
    form.commit();
    t.true(form.isPristine);
});