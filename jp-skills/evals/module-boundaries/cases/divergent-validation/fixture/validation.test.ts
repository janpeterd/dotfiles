import assert from 'node:assert/strict';
import test from 'node:test';
import {validateProjectName,validateDeviceCode} from './validation.ts';
test('existing project names and device codes', () => {
  for (const validate of [validateProjectName,validateDeviceCode]) {
    assert.deepEqual(validate('West-4'), {ok:true,value:'West-4'});
    assert.equal(validate('ab').ok, false);
    assert.equal(validate('bad/code').ok, false);
  }
});
test('device values are sent unchanged to provisioning', () => {
  assert.deepEqual(validateDeviceCode('AbC-19'), {ok:true,value:'AbC-19'});
  assert.equal(validateDeviceCode(' ABC ').ok, false);
  assert.equal(validateDeviceCode('a'.repeat(25)).ok, false);
});
