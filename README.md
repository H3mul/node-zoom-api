# Zoom REST API

A simple Zoom API implementation using [OAuth authentication](https://developers.zoom.us/docs/internal-apps/#postman) and the [got HTTP client](https://github.com/sindresorhus/got)

NOTE: Not all endpoints are implemented, but it should be trivial to implement them in `zoom-endpoints.ts` using the underlying REST API library

## Example:

A simple example enumerating all the recordings saved in account

```typescript
import Zoom from 'zoom-api';

const zoom = Zoom({
    account_id: 'ACCOUNT_ID',
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET'
});

const users = await zoom.getUsers();
console.debug(JSON.stringify(users, null, 2));

const meetings = [];
for (let userId of users.map(user => user.id)) {
    const userMeetings = await zoom.getUserRecordings(
        userId, new Date('2020-04-01'), new Date('2020-06-01'));
    meetings.push(... userMeetings);
}

console.debug("Meetings result:")
console.debug(JSON.stringify(meetings, null, 2));
```