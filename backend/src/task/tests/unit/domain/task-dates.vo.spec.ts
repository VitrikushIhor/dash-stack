import { TaskDates } from '../../../domain/value-objects/task-dates.vo';
import {
  InvalidTaskDatesException,
  InvalidDateFormatException,
} from '../../../domain/exceptions/invalid-task-dates.exception';

describe('TaskDates', () => {
  describe('normalizeOptional()', () => {
    it('returns undefined for undefined input', () => {
      expect(TaskDates.normalizeOptional(undefined)).toBeUndefined();
    });

    it('returns null for null input', () => {
      expect(TaskDates.normalizeOptional(null)).toBeNull();
    });

    it('returns Date as-is when Date instance is passed', () => {
      const date = new Date('2024-01-15');
      expect(TaskDates.normalizeOptional(date)).toBe(date);
    });

    it('converts ISO string to Date', () => {
      const result = TaskDates.normalizeOptional('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect((result as Date).getFullYear()).toBe(2024);
    });
  });

  describe('normalizeRequired()', () => {
    it('returns undefined for undefined input', () => {
      expect(TaskDates.normalizeRequired(undefined)).toBeUndefined();
    });

    it('returns Date as-is when Date instance is passed', () => {
      const date = new Date('2024-03-01');
      expect(TaskDates.normalizeRequired(date)).toBe(date);
    });

    it('converts ISO string to Date', () => {
      const result = TaskDates.normalizeRequired('2024-03-01');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('validateRange()', () => {
    it('does not throw when startDate < dueDate', () => {
      expect(() =>
        TaskDates.validateRange(new Date('2024-01-01'), new Date('2024-12-31')),
      ).not.toThrow();
    });

    it('does not throw when startDate === dueDate', () => {
      const date = new Date('2024-06-01');
      expect(() => TaskDates.validateRange(date, date)).not.toThrow();
    });

    it('throws InvalidTaskDatesException when startDate > dueDate', () => {
      expect(() =>
        TaskDates.validateRange(new Date('2024-12-31'), new Date('2024-01-01')),
      ).toThrow(InvalidTaskDatesException);
    });

    it('does not throw when startDate is null', () => {
      expect(() =>
        TaskDates.validateRange(null, new Date('2024-12-31')),
      ).not.toThrow();
    });

    it('does not throw when dueDate is null', () => {
      expect(() =>
        TaskDates.validateRange(new Date('2024-01-01'), null),
      ).not.toThrow();
    });

    it('does not throw when both are null', () => {
      expect(() => TaskDates.validateRange(null, null)).not.toThrow();
    });
  });

  describe('parseOptional()', () => {
    it('returns undefined for undefined input', () => {
      expect(TaskDates.parseOptional(undefined)).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(TaskDates.parseOptional('')).toBeUndefined();
    });

    it('returns Date for valid ISO string', () => {
      const result = TaskDates.parseOptional('2024-06-15');
      expect(result).toBeInstanceOf(Date);
    });

    it('returns Date as-is when Date instance is passed', () => {
      const date = new Date('2024-06-15');
      expect(TaskDates.parseOptional(date)).toBe(date);
    });

    it('throws InvalidDateFormatException for invalid date string', () => {
      expect(() => TaskDates.parseOptional('not-a-date')).toThrow(
        InvalidDateFormatException,
      );
    });
  });

  describe('parseNullable()', () => {
    it('returns undefined for undefined input', () => {
      expect(TaskDates.parseNullable(undefined)).toBeUndefined();
    });

    it('returns null for null input', () => {
      expect(TaskDates.parseNullable(null)).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(TaskDates.parseNullable('')).toBeNull();
    });

    it('returns Date for valid ISO string', () => {
      const result = TaskDates.parseNullable('2024-06-15');
      expect(result).toBeInstanceOf(Date);
    });

    it('throws InvalidDateFormatException for invalid string', () => {
      expect(() => TaskDates.parseNullable('bad')).toThrow(
        InvalidDateFormatException,
      );
    });
  });
});
