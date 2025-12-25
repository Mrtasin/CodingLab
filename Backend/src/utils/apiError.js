class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    }
  }
}

export default ApiError;
