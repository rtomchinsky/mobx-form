import test from 'ava';

import { Form } from '../Form';
import { FormValue } from '../FormValue';

import { defer } from 'lodash';

class TestForm extends Form {

    fieldOne = new FormValue({
        initialValue: '',
        validator: (_, form: TestForm) => form.fieldTwo.enabled ? undefined : 'error'
    })
    fieldTwo = new FormValue({
        initialValue: '',
        onFormUpdate() {
            if (this.value.length > 1) {
                this.disable()
            } else {
                this.enable()
            }
        }
    });

}

test('Form should update before validating', (t) => {
    const form = new TestForm();
    return form.validateForm().then(() => {
        t.true(form.isValid);
        form.fieldTwo.value = 'sample text';
        return new Promise((resolve) => {
            defer(() => {
                t.false(form.isValid);
                resolve();
            });
        });
    });
});