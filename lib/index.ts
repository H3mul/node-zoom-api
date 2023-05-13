import { ZoomAuth, ZoomClient } from './api/zoom-client.js'
import { ZoomEndpoints } from './api/zoom-endpoints.js';
import { GotHttpClient } from './http/got-http-client.js'

const Zoom = (auth: ZoomAuth):ZoomEndpoints => {
    const client = new ZoomClient(auth, new GotHttpClient)
    return new ZoomEndpoints(client);
}

export default Zoom;