import { AccountsDBFields } from './accounts';

declare global {
  namespace Express {
    export interface Request {
      authenticatedAccount: AccountsDBFields | undefined;
      isSysAdmin: boolean;
    }
  }
}
