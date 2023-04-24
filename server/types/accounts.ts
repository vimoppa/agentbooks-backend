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
  password_hash: string;
}

export interface PublicAccount extends AccountMetadata {
  id?: string;

  confirmed: boolean;
  // boards: Array<BoardMetadata>; // TODO: JOIN
  // organisations: Array<OrganisationMetadata>; // TODO: JOIN
  // organisationsInvite: Array<OrganisationMetadata>; // TODO: JOIN
}

export interface AccountsDBFields extends Account, PublicAccount {
  signature: string;
  create_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface AccessToken {
  access_token: string;
  ttl: number;
}

export interface AccountsRepository {
  createAccount(account: Account): Promise<PublicAccount | Errors>;

  exists(usernameOrEmail: string): Promise<string | Errors>;

  generateAccessToken(id: string, signature: string): AccessToken;

  findOneById(id: string): Promise<AccountsDBFields | Errors>

  // generateAndSendConfirmation(id: string, emailOrPhoneNumber: string, deliveryMethod?: string): Promise<void>;
}
