import { ZoomAuth, ZoomClient } from './api/zoom-client.js'
import { GotHttpClient } from './http/got-http-client.js'

const Zoom = (auth: ZoomAuth):ZoomClient => {
    return new ZoomClient(auth, new GotHttpClient)
}

export default Zoom;