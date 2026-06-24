import { TaskNotFoundException } from '../../../domain/exceptions/task-not-found.exception';
import {
  InvalidTaskDatesException,
  InvalidDateFormatException,
} from '../../../domain/exceptions/invalid-task-dates.exception';
import { InvalidAssigneesException } from '../../../domain/exceptions/invalid-assignees.exception';
import { DomainErrorCode } from '../../../../common/exceptions/domain.exception';

describe('TaskNotFoundException', () => {
  it('has NOT_FOUND error code', () => {
    const ex = new TaskNotFoundException('task-1');
    expect(ex.code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('message contains task id', () => {
    const ex = new TaskNotFoundException('task-abc');
    expect(ex.message).toContain('task-abc');
  });

  it('name is set to class name', () => {
    const ex = new TaskNotFoundException('task-1');
    expect(ex.name).toBe('TaskNotFoundException');
  });
});

describe('InvalidTaskDatesException', () => {
  it('has BAD_REQUEST error code', () => {
    const ex = new InvalidTaskDatesException();
    expect(ex.code).toBe(DomainErrorCode.BAD_REQUEST);
  });

  it('uses default message when none provided', () => {
    const ex = new InvalidTaskDatesException();
    expect(ex.message).toContain('startDate');
  });

  it('uses custom message when provided', () => {
    const ex = new InvalidTaskDatesException('custom message');
    expect(ex.message).toBe('custom message');
  });

  it('name is set to class name', () => {
    const ex = new InvalidTaskDatesException();
    expect(ex.name).toBe('InvalidTaskDatesException');
  });
});

describe('InvalidDateFormatException', () => {
  it('has BAD_REQUEST error code', () => {
    const ex = new InvalidDateFormatException('bad-value');
    expect(ex.code).toBe(DomainErrorCode.BAD_REQUEST);
  });

  it('message contains the invalid value', () => {
    const ex = new InvalidDateFormatException('not-a-date');
    expect(ex.message).toContain('not-a-date');
  });

  it('name is set to class name', () => {
    const ex = new InvalidDateFormatException('x');
    expect(ex.name).toBe('InvalidDateFormatException');
  });
});

describe('InvalidAssigneesException', () => {
  it('has BAD_REQUEST error code', () => {
    const ex = new InvalidAssigneesException();
    expect(ex.code).toBe(DomainErrorCode.BAD_REQUEST);
  });

  it('message mentions organization', () => {
    const ex = new InvalidAssigneesException();
    expect(ex.message.toLowerCase()).toContain('organization');
  });

  it('name is set to class name', () => {
    const ex = new InvalidAssigneesException();
    expect(ex.name).toBe('InvalidAssigneesException');
  });
});
