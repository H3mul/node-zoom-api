import { HttpClient, HttpMethod, HttpRequest, HttpRequestType, HttpResponse } from '../http/base-http-client.js';
import logger from '../utils/logging.js'
import * as utils from '../utils/utils.js'

export interface BaseClientProperties {
    host: string;
    throttleSleep: number;
}

export interface AuthToken {
    token: string;
    expires: Date;
}

export abstract class BaseClient {
    abstract readonly clientProperties: BaseClientProperties;
    abstract readonly httpClient: HttpClient;

    authToken?: AuthToken;
    refreshTokenPromise?: Promise<void>;
    requestCount: number = 0;

    /*
     * Make an API request to retrieve a new token using the API secret and set it
     */
    protected abstract refreshAuthToken(): Promise<void>;

    /*
     * Headers to add to an authenticated API request
     */
    protected abstract getAuthHeaders(): Promise<Object>;
    
    /*
     * Ensure a non-expired token, async fetch it if required, and return it
     * Use this method to implement getAuthHeaders() to guarantee a fresh token
     */
    protected async getAuthToken(): Promise<AuthToken> {
        if (!this.refreshTokenPromise && (!this.authToken?.expires || this.authToken?.expires <= new Date())) {
            logger.debug("Refreshing token...")
            this.refreshTokenPromise = this.refreshAuthToken();
        } 
        if (this.refreshTokenPromise) {
            await this.refreshTokenPromise;
        }
        return this.authToken!;
    }

    /*
     * Helper func to construct a new request with defaults
     */
    protected getNewRequest(): HttpRequest {
        return {
            url: "",
            type: HttpRequestType.Json,
            method: HttpMethod.GET
        };
    }

    /*
     * Make an API request to the endpoint.
     */
    async handleApiRequest(options: HttpRequest, injectAuth: Boolean = true): Promise<HttpResponse> {
        options.prefixUrl = this.clientProperties.host;

        if (injectAuth) {
            options.headers = Object.assign(options.headers || {}, await this.getAuthHeaders());
        }

        logger.debug(`Request id=${++this.requestCount}: \n${JSON.stringify(options, null, 2)}`);
        const res = await this.httpClient.handleHttpRequest(options);
        logger.debug(`Response id=${this.requestCount}: \n${JSON.stringify(res, null, 2)}`);
        return utils.delay(this.clientProperties.throttleSleep, res);
    }
}