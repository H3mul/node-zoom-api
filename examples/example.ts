import Zoom from '../lib/index.js'

const client = Zoom({
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