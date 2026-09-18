// Server-side istanbul counters for @cypress/code-coverage. Only a `yarn build:coverage`
// build defines global.__coverage__, so this 404s everywhere else.
export default function coverage(req, res) {
  if (!global.__coverage__) {
    res.status(404).end();
    return;
  }
  res.status(200).json({ coverage: global.__coverage__ });
}
