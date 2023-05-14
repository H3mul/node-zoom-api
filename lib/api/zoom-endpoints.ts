import { HttpResponse } from "../http/base-http-client.js";
import { ZoomApiRequest, ZoomClient } from "./zoom-client.js";

interface Users { users: Object[] }

export class ZoomEndpoints {
    restApi: ZoomClient
    constructor(restApi: ZoomClient) {
        this.restApi = restApi;
    }

    // https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/users
    async getUsers(): Promise<Object[]> {
        const res = await this.restApi.makeRequest({url: 'users'}) as Users;
        return res.users;
    }

    // https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/recordingsList
    getUserRecordings(userId: string, from: Date, to: Date): Promise<Object[]> {
        return this.restApi.makeDateRangeRequest({url: `users/${userId}/recordings`}, from, to);
    }
}