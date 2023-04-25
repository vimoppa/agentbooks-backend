import { Database, db } from '../lib/db';
import { Errors, InternalServerError } from '../lib/errors';
import { Logger } from '../lib/logger';
import { Board, BoardMetadata, BoardsRepository } from '../types/repositories';

export class Boards implements BoardsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createBoard(organisationId: string, boardSlug: string): Promise<BoardMetadata | Errors> {
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
          },
        );
      },
    );
    if (response instanceof Errors) {
      return new InternalServerError('something went wrong');
    }

    return b;
  }
}

export function NewBoardsRepository(): BoardsRepository {
  return new Boards(db);
}

export const board = NewBoardsRepository();
