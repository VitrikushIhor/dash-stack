import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException, DomainErrorCode } from '../exceptions/domain.exception';

const DOMAIN_ERROR_TO_HTTP: Record<DomainErrorCode, HttpStatus> = {
  [DomainErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [DomainErrorCode.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [DomainErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [DomainErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [DomainErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [DomainErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [DomainErrorCode.UPSTREAM_SERVICE_FAILURE]: HttpStatus.BAD_GATEWAY,
  [DomainErrorCode.SERVICE_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
};

export const getDomainExceptionHttpStatus = (code: DomainErrorCode): HttpStatus =>
  DOMAIN_ERROR_TO_HTTP[code];

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = getDomainExceptionHttpStatus(exception.code);

    this.logger.error(`Http Status: ${status} Error Message: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
