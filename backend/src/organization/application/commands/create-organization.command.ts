export interface CreateOrganizationCommand {
  name: string;
  description?: string | null;
  logo?: string | null;
}
