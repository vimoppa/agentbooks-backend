import { NextFunction, Request, Response } from 'express';


interface PasswordRecoveryReq {
  usernameOrEmail: string;
}

export async function passwordRecovery(req: Request, res: Response, next: NextFunction) {
  const { usernameOrEmail }: PasswordRecoveryReq = req.body;

  // fetch user if exists
  // cleanup current password
  // generateRecoveryTokenAndSend

}

interface SetPasswordReq {
  password: string;
  // confirmedPassword: string;
}

export async function setPassword(req: Request, res: Response, next: NextFunction) {
  const { token } = req.query;
  const { password }: SetPasswordReq = req.body;

  // extract user identifier from recovery token.
  // fetch user if exists.
  // verify recovery token
  // update password
  // acknowledge

}
