import {
  AlreadyMemberException,
  InvitationAlreadySentException,
} from '../../../domain/exceptions/invitation-conflict.exception';
import {
  InvitationNotFoundException,
  InvitationNotInOrgException,
  OrgNotFoundException,
} from '../../../domain/exceptions/invitation-not-found.exception';
import {
  InvitationEmailMismatchException,
  InvitationAlreadyAcceptedException,
  InvitationExpiredException,
} from '../../../domain/exceptions/invitation-invalid.exception';
import { DomainErrorCode } from '../../../../common/exceptions/domain.exception';
import { INVITATION_ERRORS } from '../../../domain/constants/invitation-errors';

describe('AlreadyMemberException', () => {
  it('has CONFLICT error code', () => {
    const ex = new AlreadyMemberException();
    expect(ex.code).toBe(DomainErrorCode.CONFLICT);
  });

  it('uses ALREADY_MEMBER message', () => {
    const ex = new AlreadyMemberException();
    expect(ex.message).toBe(INVITATION_ERRORS.ALREADY_MEMBER);
  });

  it('name is set to class name', () => {
    const ex = new AlreadyMemberException();
    expect(ex.name).toBe('AlreadyMemberException');
  });
});

describe('InvitationAlreadySentException', () => {
  it('has CONFLICT error code', () => {
    const ex = new InvitationAlreadySentException();
    expect(ex.code).toBe(DomainErrorCode.CONFLICT);
  });

  it('uses ALREADY_SENT message', () => {
    const ex = new InvitationAlreadySentException();
    expect(ex.message).toBe(INVITATION_ERRORS.ALREADY_SENT);
  });

  it('name is set to class name', () => {
    const ex = new InvitationAlreadySentException();
    expect(ex.name).toBe('InvitationAlreadySentException');
  });
});

describe('InvitationNotFoundException', () => {
  it('has NOT_FOUND error code', () => {
    const ex = new InvitationNotFoundException();
    expect(ex.code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('uses NOT_FOUND message', () => {
    const ex = new InvitationNotFoundException();
    expect(ex.message).toBe(INVITATION_ERRORS.NOT_FOUND);
  });

  it('name is set to class name', () => {
    const ex = new InvitationNotFoundException();
    expect(ex.name).toBe('InvitationNotFoundException');
  });
});

describe('InvitationNotInOrgException', () => {
  it('has NOT_FOUND error code', () => {
    const ex = new InvitationNotInOrgException();
    expect(ex.code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('uses NOT_IN_ORG message', () => {
    const ex = new InvitationNotInOrgException();
    expect(ex.message).toBe(INVITATION_ERRORS.NOT_IN_ORG);
  });

  it('name is set to class name', () => {
    const ex = new InvitationNotInOrgException();
    expect(ex.name).toBe('InvitationNotInOrgException');
  });
});

describe('OrgNotFoundException', () => {
  it('has NOT_FOUND error code', () => {
    const ex = new OrgNotFoundException();
    expect(ex.code).toBe(DomainErrorCode.NOT_FOUND);
  });

  it('uses ORG_NOT_FOUND message', () => {
    const ex = new OrgNotFoundException();
    expect(ex.message).toBe(INVITATION_ERRORS.ORG_NOT_FOUND);
  });

  it('name is set to class name', () => {
    const ex = new OrgNotFoundException();
    expect(ex.name).toBe('OrgNotFoundException');
  });
});

describe('InvitationEmailMismatchException', () => {
  it('has BAD_REQUEST error code', () => {
    const ex = new InvitationEmailMismatchException();
    expect(ex.code).toBe(DomainErrorCode.BAD_REQUEST);
  });

  it('uses EMAIL_MISMATCH message', () => {
    const ex = new InvitationEmailMismatchException();
    expect(ex.message).toBe(INVITATION_ERRORS.EMAIL_MISMATCH);
  });

  it('name is set to class name', () => {
    const ex = new InvitationEmailMismatchException();
    expect(ex.name).toBe('InvitationEmailMismatchException');
  });
});

describe('InvitationAlreadyAcceptedException', () => {
  it('has BAD_REQUEST error code', () => {
    const ex = new InvitationAlreadyAcceptedException();
    expect(ex.code).toBe(DomainErrorCode.BAD_REQUEST);
  });

  it('uses ALREADY_ACCEPTED message', () => {
    const ex = new InvitationAlreadyAcceptedException();
    expect(ex.message).toBe(INVITATION_ERRORS.ALREADY_ACCEPTED);
  });

  it('name is set to class name', () => {
    const ex = new InvitationAlreadyAcceptedException();
    expect(ex.name).toBe('InvitationAlreadyAcceptedException');
  });
});

describe('InvitationExpiredException', () => {
  it('has BAD_REQUEST error code', () => {
    const ex = new InvitationExpiredException();
    expect(ex.code).toBe(DomainErrorCode.BAD_REQUEST);
  });

  it('uses EXPIRED message', () => {
    const ex = new InvitationExpiredException();
    expect(ex.message).toBe(INVITATION_ERRORS.EXPIRED);
  });

  it('name is set to class name', () => {
    const ex = new InvitationExpiredException();
    expect(ex.name).toBe('InvitationExpiredException');
  });
});
