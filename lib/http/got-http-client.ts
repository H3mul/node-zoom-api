import got, { OptionsInit as GotOptions } from "got";
import { HttpClient, HttpRequest, HttpRequestType, HttpResponse } from "./base-http-client.js";

export class GotHttpClient extends HttpClient {
    static toGotOptions(request: HttpRequest): GotOptions {
        const options:GotOptions = {};

        switch(request.type) {
            // case HttpRequestType.Raw:
            //     break;
            // case HttpRequestType.Stream:
                // break;
            case HttpRequestType.Json:
                options.resolveBodyOnly = true;
                options.responseType = 'json';
                break;
        }

        // Disable retries on failure
        options.retry ||= {};
        options.retry.limit = 0;

        for (let key of ['url', 'prefixUrl', 'method', 'headers', 'searchParams']) {
            if (request[key] !== undefined) {
                options[key] = request[key];
            }
        }
        // options.url = request.url;
        // options.prefixUrl = request.prefixUrl;
        // options.method = request.method;
        // options.headers = request.headers;
        // options.searchParams = request.searchParams;
        return options;
    }

    handleHttpRequest(request: HttpRequest): Promise<HttpResponse> {
        return got(GotHttpClient.toGotOptions(request) as Object);
    }
}