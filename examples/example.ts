import Zoom from '../lib/index.js'

const client = Zoom({
    account_id: 'ACCOUNT_ID',
    client_id: 'CLIENT_ID',
    client_secret: 'CLIENT_SECRET'
});

const res = await client.makeRequest({url: 'users'});
console.debug(JSON.stringify(res, null, 2));