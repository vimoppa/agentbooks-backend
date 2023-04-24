import { Logger } from './logger';

export type ErrorType =
  | 'Timeout'
  | 'NotFound'
  | 'BadRequest'
  | 'DatabaseConnection'
  | 'DatabaseOperation'
  | 'InternalServer'
  | 'DuplicateEntry'
  | 'Unauthenticated';

export enum STATUS_CODE {
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  MULTIPLE_CHOICES = 300,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  TIME_OUT = 408,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export class Errors {
  public name: ErrorType;
  public code: number;
  public message: string;

  constructor(code: number, name: ErrorType, message: any) {
    this.name = name;
    this.code = code;
    this.message = message;
    Logger.error(`ERROR: ${name} >>> ${message}`);
  }
}

export class RequestTimeout extends Errors {
  public timeout: number;

  constructor(url: string, timeout: number) {
    super(STATUS_CODE.TIME_OUT, 'Timeout', `request timeout after ${timeout}ms for request to ${url}`);
    this.timeout = timeout;
  }
}

export class NotFoundError extends Errors {
  constructor() {
    super(STATUS_CODE.NOT_FOUND, 'NotFound', 'requested resource Not Found');
  }
}

export class DatabaseConnectionError extends Errors {
  constructor(message: string) {
    super(STATUS_CODE.INTERNAL_SERVER_ERROR, 'DatabaseConnection', `${message}`);
  }
}

export class DatabaseOperationError extends Errors {
  constructor(message: string) {
    super(STATUS_CODE.INTERNAL_SERVER_ERROR, 'DatabaseOperation', `${message}`);
  }
}

export class InternalServerError extends Errors {
  constructor(message: string) {
    super(STATUS_CODE.INTERNAL_SERVER_ERROR, 'InternalServer', `${message}`);
  }
}

export class DuplicateEntryError extends Errors {
  constructor(message: string) {
    super(STATUS_CODE.INTERNAL_SERVER_ERROR, 'DuplicateEntry', `${message}`);
  }
}

export class BadRequest extends Errors {
  constructor(message: string) {
    super(STATUS_CODE.BAD_REQUEST, 'BadRequest', `${message}`);
  }
}

export class Forbidden extends Errors {
  constructor(message: string) {
    super(STATUS_CODE.UNAUTHORIZED, 'Unauthenticated', `${message}`);
  }
}
