import { HttpResponse } from "../http/base-http-client.js";
import { ZoomApiRequest, ZoomClient } from "./zoom-client.js";

interface User { id: string }
interface Users { users: User[] }

export class ZoomEndpoints {
    restApi: ZoomClient
    constructor(restApi: ZoomClient) {
        this.restApi = restApi;
    }

    async getUsers(): Promise<User[]> {
        const res = await this.restApi.makeRequest({url: 'users'}) as Users;
        return res.users;
    }
    getUserRecordings(userId: string, from: Date, to: Date): Promise<Object[]> {
        return this.restApi.makeDateRangeRequest({url: `users/${userId}/recordings`}, from, to);
    }
    makeRequest(req: ZoomApiRequest): Promise<HttpResponse> {
        return this.restApi.makeRequest(req);
    }
}