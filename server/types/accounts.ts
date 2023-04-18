import { Errors } from '../lib/errors';

interface OrganisationMetadata {
  id: string;
  slug?: string;
}

interface BoardMetadata {
  id: string;
  slug?: string;
}

export interface AccountMetadata {
  email: string;
  username?: string;
}

export interface Account extends AccountMetadata {
  passwordHash: string;
}

export interface PublicAccount extends AccountMetadata {
  id?: string;

  confirmed: boolean;
  boards: Array<BoardMetadata>;
  organisations: Array<OrganisationMetadata>;
  organisationsInvite: Array<OrganisationMetadata>;
}

export interface AccountsDBFields extends Account, PublicAccount {
  signature: string;
  createAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface AccountsRepository {
  createAccount(account: Account): Promise<PublicAccount | Errors>;
}
