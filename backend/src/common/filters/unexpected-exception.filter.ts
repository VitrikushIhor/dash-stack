import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class UnexpectedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnexpectedExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    this.logger.error({
      message: 'Unhandled HTTP request failed',
      failureCategory: this.failureCategory(exception),
    });
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
      path: request.path,
      message: 'Internal server error',
    });
  }
  private failureCategory(exception: unknown): string {
    if (exception instanceof TypeError) return 'type_error';
    if (exception instanceof SyntaxError) return 'syntax_error';
    if (exception instanceof RangeError) return 'range_error';
    if (exception instanceof Error) return 'unexpected_error';
    return 'non_error_throw';
  }
}
