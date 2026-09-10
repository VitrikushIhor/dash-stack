import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '../../../common/exceptions/domain.exception';

export class MatchAuthenticationRequiredException extends UnauthorizedException {
  constructor() {
    super('Authentication is required to play Match.');
  }
}

export class InvalidMatchSessionException extends BadRequestException {
  constructor() {
    super('Match requires 6 to 12 unique cards and a valid session time.');
  }
}

export class MatchSessionNotFoundException extends NotFoundException {
  constructor() {
    super('Match session not found.');
  }
}

export class MatchSessionExpiredException extends ConflictException {
  constructor() {
    super('Match session expired. Start a new game.');
  }
}

export class MatchSessionAlreadyCompletedException extends ConflictException {
  constructor() {
    super('Match session has already been completed.');
  }
}

export class MatchSessionIncompleteException extends ConflictException {
  constructor() {
    super('Complete every Match pair before finishing the session.');
  }
}

export class MatchPairInvalidException extends BadRequestException {
  constructor() {
    super('The card is not an unmatched pair in this Match session.');
  }
}

export class MatchWriteConflictException extends ConflictException {
  constructor() {
    super('Match changed concurrently. Please retry the request.');
  }
}
