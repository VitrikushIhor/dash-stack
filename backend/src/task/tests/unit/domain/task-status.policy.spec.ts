import { TaskStatusPolicy } from '../../../domain/policies/task-status.policy';
import { TaskStatus } from '../../../domain/enums/task-status.enum';

describe('TaskStatusPolicy', () => {
  describe('resolveCompletedAtOnCreate()', () => {
    it('returns a Date when status is COMPLETED', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnCreate(
        TaskStatus.COMPLETED,
      );
      expect(result).toBeInstanceOf(Date);
    });

    it('returns undefined when status is PLANNED', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnCreate(
        TaskStatus.PLANNED,
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined when status is UPCOMING', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnCreate(
        TaskStatus.UPCOMING,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('resolveCompletedAtOnUpdate()', () => {
    it('returns undefined when nextStatus is undefined (no status change)', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: TaskStatus.PLANNED,
        nextStatus: undefined,
      });
      expect(result).toBeUndefined();
    });

    it('returns a Date when transitioning to COMPLETED', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: TaskStatus.PLANNED,
        nextStatus: TaskStatus.COMPLETED,
      });
      expect(result).toBeInstanceOf(Date);
    });

    it('returns a Date when transitioning from UPCOMING to COMPLETED', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: TaskStatus.UPCOMING,
        nextStatus: TaskStatus.COMPLETED,
      });
      expect(result).toBeInstanceOf(Date);
    });

    it('returns null when reopening a COMPLETED task (COMPLETED → PLANNED)', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: TaskStatus.COMPLETED,
        nextStatus: TaskStatus.PLANNED,
      });
      expect(result).toBeNull();
    });

    it('returns null when reopening a COMPLETED task (COMPLETED → UPCOMING)', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: TaskStatus.COMPLETED,
        nextStatus: TaskStatus.UPCOMING,
      });
      expect(result).toBeNull();
    });

    it('returns undefined when status does not cross COMPLETED boundary (PLANNED → UPCOMING)', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: TaskStatus.PLANNED,
        nextStatus: TaskStatus.UPCOMING,
      });
      expect(result).toBeUndefined();
    });

    it('returns undefined when COMPLETED stays COMPLETED', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnUpdate({
        previousStatus: TaskStatus.COMPLETED,
        nextStatus: TaskStatus.COMPLETED,
      });
      expect(result).toBeUndefined();
    });
  });

  describe('resolveCompletedAtOnBulkStatus()', () => {
    it('returns a Date when status is COMPLETED', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnBulkStatus(
        TaskStatus.COMPLETED,
      );
      expect(result).toBeInstanceOf(Date);
    });

    it('returns null when status is PLANNED', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnBulkStatus(
        TaskStatus.PLANNED,
      );
      expect(result).toBeNull();
    });

    it('returns null when status is UPCOMING', () => {
      const result = TaskStatusPolicy.resolveCompletedAtOnBulkStatus(
        TaskStatus.UPCOMING,
      );
      expect(result).toBeNull();
    });
  });
});
