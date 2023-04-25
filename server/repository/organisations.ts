import { Database, db } from '../lib/db';
import { BadRequest, Errors, InternalServerError } from '../lib/errors';
import { Logger } from '../lib/logger';
import {
  Organisation,
  OrganisationMetadata,
  OrganisationRole,
  OrganisationsRepository,
} from '../types/accounts';

export class Organisations implements OrganisationsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createOrganisation(accountId: string, organisationSlug: string): Promise<OrganisationMetadata | Errors> {
    let org: OrganisationMetadata;

    const sql = 'INSERT INTO organisations (slug) VALUES (?)';
    const response = await this.db.transaction(
      sql, [organisationSlug],
      connection => {

        connection.query(
          'SELECT id, slug FROM organisations WHERE slug = ?', [organisationSlug],
          (e, results) => {
            if (e) throw e;
            org = results[0];

            const agSQL = 'INSERT INTO accounts_organisations (account_id, organisation_id, confirmed, role)  VALUES (?, ?, ?, ?)';
            connection.query(agSQL, [accountId, org.id, true, OrganisationRole.Manager]);
          },
        );
      },
    );
    if (response instanceof Errors) {
      return new InternalServerError('something went wrong!');
    }

    return org;
  }

  async findOneById(id: string): Promise<Organisation | Errors> {
    const sql = `SELECT o.*, a.*, ao.role
                 FROM organisations o
                          LEFT JOIN accounts_organisations ao ON o.id = ao.organisation_id
                          LEFT JOIN accounts a ON ao.account_id = a.id
                 WHERE o.id = ?`;
    const response: Array<object> | Errors = await this.db.query(sql, [id]);
    if (response instanceof Errors) {
      return new InternalServerError(response.message);
    }

    if (!response && !response.length) {
      return new BadRequest('organisation with id doesn\'t exist');
    }
    Logger.debug(response);

    return response[0] as Organisation;
  }

}

export function NewOrganisationsRepository(): OrganisationsRepository {
  return new Organisations(db);
}

export const organisation = NewOrganisationsRepository();
