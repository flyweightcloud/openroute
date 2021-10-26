/* tslint:disable  max-classes-per-file */
import { Context, } from "@azure/functions";

export class HttpError extends Error {
    status: number;

    constructor(msg: string, status: number) {
        super(msg); // 'Error' breaks prototype chain here
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}

export class NotFound extends HttpError {
    constructor(msg: string) {
        super(msg, 404);
    }
}

export class Unauthorized extends HttpError {
    constructor(msg: string) {
        super(msg, 404);
    }
}


export function handleError(err: Error | HttpError, context: Context) {
    if (err instanceof HttpError) {
        context.res = {
            status: err.status.toString(),
            body: {
                error: {
                    name: err.name,
                    message: err.message,
                    status: err.status,
                },
            },
        };
    } else {
        context.res = {
            status: "500",
            body: {
                error: {
                    name: err.name,
                    message: err.message,
                },
            },
        };
    }
}
