export interface MembershipRepositoryPort {
  validateMemberships(
    organizationId: string,
    membershipIds: string[],
  ): Promise<boolean>;
}
