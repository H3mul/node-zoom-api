import test from 'ava';
import { HttpMethod, HttpRequestType } from '../lib/http/base-http-client.js';
import { GotHttpClient } from '../lib/http/got-http-client.js';

test('GotHttpClient correctly maps raw HttpRequest to GotOptions', async t => {
    const options = GotHttpClient.toGotOptions({
        method: HttpMethod.GET,
        url: 'testurl',
        type: HttpRequestType.Raw
    });

    t.is(options.method, 'get');
    t.is(options.url, 'testurl');
});

test('GotHttpClient correctly maps json HttpRequest to GotOptions', async t => {
    const options = GotHttpClient.toGotOptions({
        method: HttpMethod.POST,
        url: 'testurl',
        type: HttpRequestType.Json
    });

    t.is(options.method, 'post');
    t.is(options.url, 'testurl');
    t.is(options.responseType, 'json');
    t.truthy(options.resolveBodyOnly);
});