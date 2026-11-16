import { memoizeOne } from 'utils/memoize';
import { parseObservations } from 'utils/observations';

const getParsedTableObservations = memoizeOne((observations) => (
  observations && observations.length ? parseObservations(observations) : []
));

export { getParsedTableObservations };
