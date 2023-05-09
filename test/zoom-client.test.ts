import test from 'ava';
import { ZoomApiRequest, ZoomClient } from "../lib/api/zoom-client.js";
import { HttpRequest, HttpRequestType } from '../lib/http/base-http-client.js';
import DateFormatter from 'date-and-time';
import { MockHttpClient } from '../lib/http/mock-http-client.js';
import logger from '../lib/utils/logging.js';

import meetingListResponse from './fixtures/list_all_recordings.json' assert { type: "json"};

logger.setConsoleVerbosity('error');

function getClients(mockAuthToken: Boolean = true) {
    const httpClient = new MockHttpClient();
    const client = new ZoomClient({
        account_id: "1234",
        client_id: "5678",
        client_secret: "supersecret"
    }, httpClient);

    if (mockAuthToken) {
        client.authToken = {
            token: "testtoken",
            expires: DateFormatter.addDays(new Date(), 1)
        }
    }
    return { httpClient, client };
}

test('succeeds setup', t => {
    const { client } = getClients();
    t.truthy(client instanceof ZoomClient)
});

test('invalid token throws error', async t => {
    const { client, httpClient } = getClients(false);
    httpClient.onRequest(() => { return { garbage: "token" }; });
    await t.throwsAsync(client.refreshAuthToken());
});

test('fetches a new token', async t => {
    const { client, httpClient } = getClients(false);
    t.is(client.authToken, undefined);
    httpClient.onRequest((req: HttpRequest) => {
        t.deepEqual(req, {
            method: "post",
            url: "https://zoom.us/oauth/token",
            searchParams: {
                grant_type: "account_credentials",
                account_id: "1234"
            },
            headers: {
                Authorization: "Basic NTY3ODpzdXBlcnNlY3JldA=="
            },
            type: HttpRequestType.Json
        });

        return {
            Access_token: "testtoken",
            Expire_in: 10
        };
    });

    await client.refreshAuthToken()
    t.not(client.authToken, undefined);
    t.truthy(client.authToken?.expires instanceof Date);
    t.truthy(client.authToken?.expires! > new Date());
});

test('correctly constructs token auth headers and injects them into requests', async t => {
    const { client, httpClient } = getClients();
    const authHeaders = {Authorization: `Bearer testtoken`};

    t.deepEqual(await client.getAuthHeaders(), authHeaders);
    httpClient.onRequest((req: HttpRequest) => {
        t.deepEqual(req.headers, authHeaders);
        return {};
    });
    await client.makeRequest({ url: '/meetings/meetingId/recordings' });
});

test('refreshes token on request if its missing', async t => {
    const { client, httpClient } = getClients(false);
    httpClient.onRequest((req: HttpRequest) => {
        return {
            Access_token: "testtoken",
            Expire_in: 10
        };
    });

    const mockData = { apiData: "data" };

    httpClient.onRequest((req: HttpRequest) => mockData);
    const res = await client.makeRequest({ url: '/meetings/meetingId/recordings'});

    t.is(res, mockData);
    t.truthy(client.authToken?.expires! > new Date());
});

test('refreshes token on request if its expired', async t => {
    const { client, httpClient } = getClients(false);

    client.authToken = {
        token: "authtoken",
        expires: DateFormatter.addDays(new Date(), -1)
    }

    httpClient.onRequest((req: HttpRequest) => {
        return {
            Access_token: "testtoken",
            Expire_in: 10
        };
    });

    const mockData = { apiData: "data" };

    httpClient.onRequest((req: HttpRequest) => mockData );
    const res = await client.makeRequest({ url: '/meetings/meetingId/recordings'});

    t.is(res, mockData);
    t.truthy(client.authToken?.expires! > new Date());
});

test('skips token refresh if its unexpired', async t => {
    const { client, httpClient } = getClients();
    const mockData = { apiData: "data" };
    httpClient.onRequest((req: HttpRequest) => {
        if (req.url == `https://zoom.us/oauth/token`) {
            throw new Error("Should not be requesting a new token");
        }
        return mockData;
    });

    const res = await client.makeRequest({ url: '/meetings/meetingId/recordings'});
    t.is(res, mockData);
    t.truthy(client.authToken?.expires! > new Date());
});

// https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meeting
test('correctly makes a GET api request', async t => {
    const { client, httpClient } = getClients();
    httpClient.onRequest((req: HttpRequest) => meetingListResponse.meetings[0])
    const res = await client.makeRequest({ url: '/meetings/meetingId/recordings'});
    t.is(res, meetingListResponse.meetings[0]);
});

test('correctly makes a paginated api request', async t => {
    const { client, httpClient } = getClients();

    for(let i = 1; i <= 3; i++) {
        httpClient.onRequest((req: HttpRequest) => {
            if (i > 1) {
                // Check previous token was entered
                t.is(req.searchParams.next_page_token, 'nexttoken' + (i - 1))
            }

            return {
                page_size: 2,
                page_count: i,
                next_page_token: (i < 3) ? 'nexttoken' + i : undefined,
                total_records: 6,
                meetings:[
                    meetingListResponse.meetings[(i-1)*2],
                    meetingListResponse.meetings[(i-1)*2 + 1],
                ]
            }
        });
    }

    const res = await client.makePaginatedRequest({ url: '/users/userId/recordings'});
    t.deepEqual(res, meetingListResponse.meetings);
});

test('correctly makes a date range api request', async t => {
    const { client, httpClient } = getClients();

    const from = DateFormatter.parse("2020-06-15", 'YYYY-MM-DD');
    const to = DateFormatter.parse("2020-09-03", 'YYYY-MM-DD');

    const fromDates = ["2020-06-15", "2020-07-15", "2020-08-15"];
    const toDates = ["2020-07-15", "2020-08-15", "2020-09-03"];
    
    // date requests
    for(let j = 0; j < 3; j++) {
        // pagination requests
        for(let i = 0; i < 2; i++) {
            httpClient.onRequest((req: HttpRequest) => {
                // Check date range is correct
                t.is(req.searchParams.from, fromDates[j]);
                t.is(req.searchParams.to, toDates[j]);

                if (i > 0) {
                    // Check previous token was entered
                    t.is(req.searchParams.next_page_token, 'nexttoken' + (i - 1))
                }

                return {
                    page_size: 1,
                    page_count: i,
                    next_page_token: (i == 0) ? 'nexttoken' + i : undefined,
                    total_records: 2,
                    meetings: [
                        meetingListResponse.meetings[j * 2 + i]
                    ]
                }
            });
        }
    }

    const res = await client.makeDateRangeRequest({url: '/users/userId/recordings'}, from, to);
    t.deepEqual(res, meetingListResponse.meetings);
});