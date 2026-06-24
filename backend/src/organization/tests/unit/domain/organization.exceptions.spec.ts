import { OrganizationNotFoundException } from '../../../domain/exceptions/organization-not-found.exception';
import { MemberNotFoundException } from '../../../domain/exceptions/member-not-found.exception';
import { DomainErrorCode } from '../../../../common/exceptions/domain.exception';

describe('OrganizationNotFoundException', () => {
  it('is instance of NotFoundException', () => {
    const ex = new OrganizationNotFoundException('org-1');
    expect(ex).toBeInstanceOf(OrganizationNotFoundException);
  });

  it('has NOT_FOUND error code', () => {
    const ex = new OrganizationNotFoundException('org-1');
    expect(ex.code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('message contains org id', () => {
    const ex = new OrganizationNotFoundException('org-abc');
    expect(ex.message).toContain('org-abc');
  });

  it('name is set to class name', () => {
    const ex = new OrganizationNotFoundException('org-1');
    expect(ex.name).toBe('OrganizationNotFoundException');
  });
});

describe('MemberNotFoundException', () => {
  it('is instance of MemberNotFoundException', () => {
    const ex = new MemberNotFoundException('org-1', 'user-1');
    expect(ex).toBeInstanceOf(MemberNotFoundException);
  });

  it('has NOT_FOUND error code', () => {
    const ex = new MemberNotFoundException('org-1', 'user-1');
    expect(ex.code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('message contains orgId', () => {
    const ex = new MemberNotFoundException('org-42', 'user-1');
    expect(ex.message).toContain('org-42');
  });

  it('message contains userId', () => {
    const ex = new MemberNotFoundException('org-1', 'user-99');
    expect(ex.message).toContain('user-99');
  });

  it('name is set to class name', () => {
    const ex = new MemberNotFoundException('org-1', 'user-1');
    expect(ex.name).toBe('MemberNotFoundException');
  });
});
