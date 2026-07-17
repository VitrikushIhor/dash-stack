import {
  InvalidTaskDatesException,
  InvalidDateFormatException,
} from '../exceptions/invalid-task-dates.exception';

export class TaskDates {
  static normalizeOptional(
    value?: string | Date | null,
  ): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return value instanceof Date ? value : new Date(value);
  }

  static normalizeRequired(value?: string | Date): Date | undefined {
    if (value === undefined || value === null) return undefined;
    return value instanceof Date ? value : new Date(value);
  }

  static validateRange(startDate?: Date | null, dueDate?: Date | null): void {
    if (startDate && dueDate && startDate > dueDate) {
      throw new InvalidTaskDatesException();
    }
  }

  static parseOptional(value?: string | Date): Date | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new InvalidDateFormatException(String(value));
    }

    return date;
  }

  static parseNullable(value?: string | Date | null): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (value === '') return null;

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new InvalidDateFormatException(String(value));
    }

    return date;
  }
}
