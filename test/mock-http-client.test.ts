import test from 'ava';
import { MockHttpClient } from '../lib/http/mock-http-client.js';
import { HttpMethod, HttpRequestType } from '../lib/http/base-http-client.js';

test('MockHttpClient test request hook register', async t => {
    const client = new MockHttpClient();
    t.plan(3);

    client.onRequest((req) => {
        if (req.url == 'firstrequest')
            t.pass();
    });

    client.onRequest((req) => {
        if (req.url == 'secondrequest')
            t.pass();
    });

    await client.handleHttpRequest({
        url: 'firstrequest',
        type: HttpRequestType.Json,
        method: HttpMethod.GET
    });

    await client.handleHttpRequest({
        url: 'secondrequest',
        type: HttpRequestType.Json,
        method: HttpMethod.GET
    });

    await t.throws(() => client.handleHttpRequest({
        url: 'unexpectedrequest',
        type: HttpRequestType.Json,
        method: HttpMethod.GET
    }));
});