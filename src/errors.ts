/* tslint:disable  max-classes-per-file */

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
