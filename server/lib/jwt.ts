import jwt from 'jsonwebtoken';
import moment from 'moment';

import { Errors, InternalServerError } from './errors';
import { Logger } from './logger';

const daysToSeconds = days => moment.duration({ days }).asSeconds();
const minutesToSeconds = minutes => moment.duration({ minutes }).asSeconds();

export const TOKEN_EXPIRATION_LOGIN = minutesToSeconds(75);
export const TOKEN_EXPIRATION_SESSION = daysToSeconds(90);

const ALGORITHM = 'HS256';
const KID = 'HS256-2020-06-01';

export function createToken(sub: string, secret: string, ttl: number, payload?: string | Record<string, unknown>) {
  return jwt.sign(payload || {}, secret, {
    expiresIn: ttl,
    subject: String(sub),
    algorithm: ALGORITHM,
    header: { alg: ALGORITHM, kid: KID },
  });
}

export async function verifyToken(token: string, secret: string): Promise<string | jwt.JwtPayload | Errors> {
  try {
    return jwt.verify(token, secret);
  } catch(e) {
    Logger.error(e);
    return new InternalServerError('token verification failed');
  }
}

export function decodeToken(token: string) {
  return jwt.decode(token, { json: true, complete: true });
}
