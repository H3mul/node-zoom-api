import { InvalidInputException } from "./error.js";

export function toBase64 (data: any) {
    return Buffer.from(data).toString('base64');
}
export function delay<T>(ms: number, value: T): Promise<T>{
    return new Promise((r) => setTimeout(r, ms, value));
}

export function getFirstArrayKey(data: Object): string {
    for(const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            return key;
        }
    }
    throw new InvalidInputException("Object does not have an array key");
}

export function minDate(date1: Date, date2: Date):Date {
    return (date1 < date2) ? date1 : date2;
}