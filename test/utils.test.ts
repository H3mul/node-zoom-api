import test from 'ava';
import { InvalidInputException } from '../lib/utils/error.js';
import * as utils from '../lib/utils/utils.js';

test('getFirstArrayKey() fails with empty object', async t => {
    t.throws(() => utils.getFirstArrayKey({}), {instanceOf: InvalidInputException});
});

test('getFirstArrayKey() fails with no array key', async t => {
    t.throws(() => utils.getFirstArrayKey({ "key1": "value1" }), { instanceOf: InvalidInputException });
});

test('getFirstArrayKey() succeeds with one array key', t => {
    let key = utils.getFirstArrayKey({"key1": "value1", "key2": []});
    t.is(key, "key2");

    key = utils.getFirstArrayKey({"key1": "value1", "key2": [ 'value2', 'value3' ]});
    t.is(key, "key2");
});

test('getFirstArrayKey() succeeds with multiple array keys', async t => {
    let key = utils.getFirstArrayKey({"key1": "value1", "key2": [ 'value2', 'value3' ], "key3": [1, 2, 3]});

    const correctKeys = ['key2', 'key3'];
    t.truthy(correctKeys.includes(key));
});

test('toBase64() succeeds', t => {
    t.is(utils.toBase64("teststring"), "dGVzdHN0cmluZw==")
});

test('delay() succeeds', t => {
    t.plan(1);
    return utils.delay(5, 'value').then(value => {
        t.is(value, 'value');
    })
});

test('minDate() succeeds', t => {
    const date1 = new Date();
    const date2 = new Date(date1.getSeconds() - 5);
    t.is(utils.minDate(date1, date2), date2);
    t.is(utils.minDate(date2, date1), date2);
});