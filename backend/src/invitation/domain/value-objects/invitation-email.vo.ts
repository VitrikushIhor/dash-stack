export class InvitationEmail {
  readonly value: string;

  constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  equals(other: string): boolean {
    return this.value === new InvitationEmail(other).value;
  }
}
