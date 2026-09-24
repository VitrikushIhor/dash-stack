import { HttpStatus } from '@nestjs/common';
import { DomainErrorCode } from '../exceptions/domain.exception';
import { getDomainExceptionHttpStatus } from './domain-exception.filter';

describe('getDomainExceptionHttpStatus', () => {
  it.each([
    [DomainErrorCode.UPSTREAM_SERVICE_FAILURE, HttpStatus.BAD_GATEWAY],
    [DomainErrorCode.SERVICE_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE],
  ] as const)('should_map_%s_to_%s', (code, expectedStatus) => {
    expect(getDomainExceptionHttpStatus(code)).toBe(expectedStatus);
  });
});
