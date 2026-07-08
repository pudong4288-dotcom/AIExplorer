export class HttpError extends Error {
  statusCode: number;
  code: string;
  userMessage: string;

  constructor(statusCode: number, code: string, userMessage: string) {
    super(userMessage);
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage;
  }
}

export class ProviderConfigError extends Error {}

export class InvalidModelResponseError extends Error {}

export class UnclearImageError extends Error {}
