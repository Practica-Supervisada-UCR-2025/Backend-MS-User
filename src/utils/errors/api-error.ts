export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details?: string[]) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', details?: string[]) {
    super(401, message, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', details?: string[]) {
    super(403, message, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', details?: string[]) {
    super(404, message, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: string[]) {
    super(409, message, details);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: string[]) {
    super(500, message, details);
  }
}