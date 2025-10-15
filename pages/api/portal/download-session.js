export default async (req, res) => {
  fetch(`${process.env.OTP_API}/sessions/download-session`, {
    method: 'POST',
    headers: {
      authorization: req.headers.authorization,
      'OTP-API-KEY': process.env.OTP_API_KEY
    }
  })
    .then((response) => {
      if (response.ok) {
        // pass cookies
        if (response.headers.get('set-cookie')) {
          res.setHeader('set-cookie', response.headers.get('set-cookie'));
        }
        return response.text();
      }

      throw new Error(response.statusText);
    })
    .then(async (text) => {
      res.send(text);
    })
    .catch(() => {
      res.status(401).json({ error: 'Something went wrong!!. User unauthorized.' });
    });
}
