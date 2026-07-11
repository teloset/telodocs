export class ResponseHandledException extends Error {
  constructor() {
    super("Response already handled");
    this.name = "ResponseHandledException";
  }
}
