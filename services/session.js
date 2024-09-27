import { getIronSession } from 'iron-session';

export const getSession = (req, res) =>
  getIronSession(req, res, { password: process.env.SECRET, cookieName: "session", cookieOptions: { maxAge: undefined } });
