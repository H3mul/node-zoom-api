export enum HttpRequestType {
    Raw,
    Json
    // Stream
}

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PATCH = 'patch',
    PUT = 'put',
}

export interface HttpRequest {
    prefixUrl?: string;
    headers?: Record<string, string | string[] | undefined>;
    searchParams?: Record<string, string | number | boolean | null | undefined>;
    url: string;
    type: HttpRequestType;
    method: HttpMethod;
}

export interface HttpResponse extends Object {}

export abstract class HttpClient {
    abstract handleHttpRequest(request: HttpRequest): Promise<HttpResponse>;
}