export interface InvitationMailerPort {
  sendInviteEmail(email: string, token: string, orgName: string): Promise<void>;
}
