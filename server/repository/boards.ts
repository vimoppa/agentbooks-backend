import { Database, db } from '../lib/db';
import { BadRequest, Errors, InternalServerError } from '../lib/errors';
import { Logger } from '../lib/logger';
import { Board, BoardMetadata, BoardsRepository, Organisation, OrganisationRole } from '../types/repositories';

export class Boards implements BoardsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createBoard(organisationId: string, boardSlug: string, accountId: string): Promise<BoardMetadata | Errors> {
    let b: Board;
    Logger.debug({ organisationId, boardSlug });

    const sql = 'INSERT INTO boards (organisation_id, slug) VALUES (?,?)';
    const response = await this.db.transaction(sql, [organisationId, boardSlug],
      connection => {
        connection.query(
          'SELECT id, slug, organisation_id FROM boards WHERE slug = ?', [boardSlug],
          (e, results) => {
            if (e) throw e;
            b = results[0];

            const agSQL = 'INSERT INTO accounts_boards (board_id, account_id, permission)  VALUES (?, ?, ?)';
            connection.query(agSQL, [b.id, accountId, OrganisationRole.Manager]);
          },
        );
      },
    );
    if (response instanceof Errors) {
      return new InternalServerError('something went wrong');
    }

    return b;
  }

  async findOneById(id: string): Promise<BoardMetadata | Errors> {
    const sql = 'SELECT * FROM boards WHERE id = ?';
    const response: Array<object> | Errors = await this.db.query(sql, [id]);
    if (response instanceof Errors) {
      return new InternalServerError(response.message);
    }

    if (!response && response.length <= 0) {
      return new BadRequest('board with id doesn\'t exist');
    }

    return response[0] as BoardMetadata;
  }
}

export function NewBoardsRepository(): BoardsRepository {
  return new Boards(db);
}

export const board = NewBoardsRepository();
