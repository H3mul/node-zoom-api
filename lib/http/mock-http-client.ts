import logger from "../utils/logging.js";
import { HttpClient, HttpRequest, HttpResponse } from "./base-http-client.js";

interface Hook { (request: HttpRequest): HttpResponse | void }

export class MockHttpClient extends HttpClient {
    hooks: Hook[] = [];

    onRequest(hook:Hook):void {
        this.hooks.push(hook);
    }

    handleHttpRequest(request: HttpRequest): Promise<HttpResponse> {
        if(!this.hooks.length)
            throw new Error("No mock interaction expected");
        return Promise.resolve(this.hooks.shift()(request) || {});
    }
}
