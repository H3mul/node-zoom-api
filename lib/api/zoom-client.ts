import { BaseClient, BaseClientProperties } from "./base-client.js";
import { HttpClient, HttpRequest, HttpRequestType, HttpResponse } from "../http/base-http-client.js";
import * as utils from '../utils/utils.js';
import DateFormatter from 'date-and-time';
import { HttpMethod } from "../http/base-http-client.js";
import logger from "../utils/logging.js";

export interface ZoomAuth {
    account_id: string;
    client_id: string;
    client_secret: string;
}

export interface ZoomAuthResponse {
    Access_token: string;
    Expire_in: number;
}

export type ZoomApiRequestParams = Record<string, string | number | boolean | null | undefined>;

export interface ZoomApiRequest {
    url: string;
    params?: ZoomApiRequestParams;
    method?: HttpMethod;
}

export interface ZoomClientProperties extends BaseClientProperties {
    dateFormat: string
}

export class ZoomClient extends BaseClient {
    httpClient: HttpClient;
    readonly auth: ZoomAuth;
    readonly clientProperties: ZoomClientProperties = {
        host: "https://api.zoom.us/v2",
        // https://marketplace.zoom.us/docs/api-reference/rate-limits/#rate-limits
        throttleSleep: 100, //ms
        dateFormat: 'YYYY-MM-DD'
    }

    constructor(auth: ZoomAuth, httpClient: HttpClient) {
        super();
        this.auth = auth;
        this.httpClient = httpClient;
    }

    override async refreshAuthToken(): Promise<void> {
        // https://developers.zoom.us/docs/internal-apps/#postman
        const res = await this.httpClient.handleHttpRequest({
            method: HttpMethod.POST,
            url: `https://zoom.us/oauth/token`,
            searchParams: { grant_type: 'account_credentials', account_id: this.auth.account_id },
            headers: { Authorization: 'Basic ' + utils.toBase64(`${this.auth.client_id}:${this.auth.client_secret}`) },
            type: HttpRequestType.Json
        }) as ZoomAuthResponse;

        if (res.Access_token === undefined || res.Expire_in === undefined) {
            throw new Error("Invalid token returned from Zoom")    
        }

        this.authToken = {
            token: res.Access_token,
            expires: DateFormatter.addSeconds(new Date(), res.Expire_in * 1000)
        }
    }

    override async getAuthHeaders(): Promise<Object> {
        return { Authorization: `Bearer ${(await this.getAuthToken()).token}` };
    }

    async makeRequest(request: ZoomApiRequest): Promise<HttpResponse> {
        const options = this.getNewRequest();
        options.url = request.url;
        options.method = request.method || HttpMethod.GET;
        options.searchParams = request.params;
        return this.handleApiRequest(options);
    }

    /*
     * Zoom handles pagination via a next page token:
     * https://developers.zoom.us/docs/api/rest/pagination/
     * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingRegistrants
     * 
     * Make an API requests until there are no more pages, then return concatenated data
     * The data array of items is implicitly found as the first array key in the response data
     */
    async makePaginatedRequest(request: ZoomApiRequest): Promise<Object[]> {
        const searchParams:any = { page_size: 300 };

        const result: Object[] = [];
        let dataKey: string;
        do {
            request.params = Object.assign(request.params || {}, searchParams);
            const res:any = await this.makeRequest(request);

            if ('next_page_token' in res) {
                // Assume the first array key is the data to concatenate pagination on
                dataKey ||= utils.getFirstArrayKey(res);
                result.push(...res[dataKey]);

                if (!res.next_page_token) break;
                searchParams.next_page_token = res.next_page_token;
            }
        } while(true);
        return result;
    }

    /*
     * Zoom only allows enumeration using date ranges, 1 month at a time, each on paginated
     * https://developers.zoom.us/docs/api/rest/pagination/
     * https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingRegistrants
     * 
     * Make requests with 1 month date range in the provided start/end times, handle pagination
     * Return the concatenated result
     */
    async makeDateRangeRequest(request: ZoomApiRequest, from: Date, to: Date): Promise<Object[]> {
        request.params ||= {};
        const result: Object[] = [];
        let currentFrom: Date = from;
        let currentTo: Date;
        while(currentFrom < to) {
            // Increment "to" date, cap to the "to" date end
            currentTo = utils.minDate(DateFormatter.addMonths(currentFrom, 1), to);

            request.params.from = DateFormatter.format(currentFrom, this.clientProperties.dateFormat);
            request.params.to = DateFormatter.format(currentTo, this.clientProperties.dateFormat);

            const res:any = await this.makePaginatedRequest(request);
            result.push(...res);

            // Increment "from" date
            currentFrom = currentTo
        }
        return result;
    }
}