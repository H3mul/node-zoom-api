import got, { OptionsInit as GotOptions } from "got";
import { HttpClient, HttpRequest, HttpRequestType, HttpResponse } from "./base-http-client.js";

export class GotHttpClient extends HttpClient {
    static toGotOptions(request: HttpRequest): GotOptions {
        const options:GotOptions = Object.assign({}, request);

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

        return options;
    }

    handleHttpRequest(request: HttpRequest): Promise<HttpResponse> {
        return got(GotHttpClient.toGotOptions(request) as Object);
    }
}