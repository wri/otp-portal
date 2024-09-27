import { getSession } from 'services/session';

export default async (req, res) => {
  const session = await getSession(req, res);

  fetch(`${process.env.OTP_API}/login`, {
    method: 'POST',
    headers: {
      'OTP-API-KEY': process.env.OTP_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body)
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(async (data) => {
      session.user = data;
      await session.save();
      res.json(data);
    })
    .catch(() => {
      res.status(401).json({ error: 'Something went wrong!!. User unauthorized.' });
    });
}
