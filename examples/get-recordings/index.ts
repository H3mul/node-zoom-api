import Zoom, { enableLogging } from '../../lib/index.js'

enableLogging('debug');

const zoom = Zoom({
    account_id: 'ACCOUNT_ID',
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET'
});

type User = { id: string };

const users = await zoom.getUsers() as User[];
console.debug(JSON.stringify(users, null, 2));

const meetings = users.map(async user =>
        await zoom.getUserRecordings(user.id, new Date('2020-04-01'), new Date('2020-06-01')))
        .flat()

console.debug("Meetings result:")
console.debug(JSON.stringify(meetings, null, 2));