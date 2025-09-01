import { getSession } from 'services/session';

export default async (req, res) => {
  const session = await getSession(req, res);
  if (session.user && session.user.token) {
    const apiResponse = await fetch(`${process.env.OTP_API}/logout`, {
      method: 'DELETE',
      headers: {
        ...req.headers,
        Authorization: `Bearer ${session.user.token}`
      }
    });
    // if backend clears or sets some cookies let's pass that to the app
    if (apiResponse.headers.get('set-cookie')) {
      res.setHeader('set-cookie', apiResponse.headers.get('set-cookie'));
    }
  }
  session.destroy();
  res.json({});
}
