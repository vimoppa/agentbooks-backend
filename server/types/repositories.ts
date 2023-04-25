import { Errors } from '../lib/errors';

export interface OrganisationMetadata {
  id: string;
  slug?: string;
}

export interface BoardMetadata {
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

  findOneById(id: string): Promise<AccountsDBFields | Errors>;

  // generateAndSendConfirmation(id: string, emailOrPhoneNumber: string, deliveryMethod?: string): Promise<void>;
}

// TODO: change use of array to map: key -> account_id, value -> role
export interface Organisation extends OrganisationMetadata {
  admins: Array<PublicAccount>;
  members: Array<PublicAccount>;

  create_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface OrganisationsRepository {
  createOrganisation(accountId: string, organisationSlug: string): Promise<OrganisationMetadata | Errors>;

  findOneById(id: string): Promise<Organisation | Errors>;

  // organisationAndAccountAssociatedById(accountId: string, organisationId: string): Promise<AccountsOrganisations | Errors>;
}

export enum OrganisationRole {
  Manager = 'manager', // Admin -> A
  Member = 'member' // Member -> M
}

export interface AccountsOrganisations {
  account_id: string;
  organisation_id: string;
  confirmed: boolean;
  role: OrganisationRole;

  created_at: string;
  updated_at: string;
  // deleted_at: string;
}

export interface Board extends BoardMetadata {
  organisation_id: string;
}

// TODO: make migration to change permission type
export enum BoardPermission {
  Owner = 'owner', // Owner -> RWD -> 3
  Member = 'member', // Member -> RW -> 2
}

export interface AccountsBoards {
  account_id: string;
  board_id: string;
  role: BoardPermission;
}

export interface Board extends BoardMetadata {
  account_permission: Map<AccountsBoards['account_id'], BoardPermission>;
}

export interface BoardsRepository {
  createBoard(organisationId: string, boardSlug: string, accountId: string): Promise<BoardMetadata | Errors>;

  findOneById(id: string): Promise<BoardMetadata | Errors>;
}

export interface Card {
  description: string;
  board_id: string;
  assigned_to?: string;
  reported_by: string;
}

export interface CardDBFields extends Card {
  id: string;
  created_at: string;
}

export interface CardsRepository {
  createCard(card: Card): Promise<CardDBFields | Errors>;
}
