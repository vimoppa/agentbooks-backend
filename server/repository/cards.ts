import { Database, db } from '../lib/db';
import { Errors, InternalServerError } from '../lib/errors';
import { Logger } from '../lib/logger';
import { Card, CardDBFields, CardsRepository } from '../types/repositories';


export class Cards implements CardsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createCard(card: Card): Promise<CardDBFields | Errors> {
    let c: CardDBFields;
    Logger.debug(card);

    const sql = 'INSERT INTO cards (descriptions, board_id, reported_by, assigned_to) VALUES (?, ?, ?, ?)';
    const response = await this.db.transaction(sql, [card.description, card.board_id, card.reported_by, card.assigned_to ?? null],
      connection => {
        connection.query(
          'SELECT * FROM cards WHERE id = LAST_INSERT_ID()',
          (e, results) => {
            if (e) throw e;
            c = results[0];
          },
        );
      },
    );
    if (response instanceof Errors) {
      return new InternalServerError('something went wrong');
    }

    return c;
  }
}


export function NewCardsRepository(): CardsRepository {
  return new Cards(db);
}

export const card = NewCardsRepository();
