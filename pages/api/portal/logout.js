import { getIronSession } from 'iron-session';

export default async (req, res) => {
  const session = await getIronSession(req, res, { password: process.env.SECRET, cookieName: "session" });
  session.destroy();
  res.json({});
}
