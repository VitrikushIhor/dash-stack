export class UpdateCurrentUserCommand {
  userId: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  bio?: string;
  urls?: string[];
  avatar?: string;
}
