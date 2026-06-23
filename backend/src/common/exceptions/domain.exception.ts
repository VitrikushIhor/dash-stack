/**
 * Base class for all domain-level exceptions.
 *
 * Domain exceptions carry NO framework dependency (no NestJS, no HTTP).
 * They are caught by the global DomainExceptionFilter and mapped to
 * the appropriate HTTP status code at the presentation boundary.
 */

export enum DomainErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  FORBIDDEN = 'FORBIDDEN',
}

export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: DomainErrorCode,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundException extends DomainException {
  constructor(message: string) {
    super(message, DomainErrorCode.NOT_FOUND);
  }
}

export class BadRequestException extends DomainException {
  constructor(message: string) {
    super(message, DomainErrorCode.BAD_REQUEST);
  }
}

export class ConflictException extends DomainException {
  constructor(message: string) {
    super(message, DomainErrorCode.CONFLICT);
  }
}

export class ForbiddenException extends DomainException {
  constructor(message: string) {
    super(message, DomainErrorCode.FORBIDDEN);
  }
}
