export class UpdateCurrentUserCommand {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  dob?: string | null;
  bio?: string | null;
  urls?: string[];
  avatar?: string | null;
}
