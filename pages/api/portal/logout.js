import { getSession } from 'services/session';

export default async (req, res) => {
  const session = await getSession(req, res);
  session.destroy();
  res.json({});
}
