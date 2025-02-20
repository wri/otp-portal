import Fuse from 'fuse.js';
import { SEARCH_OPTIONS } from 'constants/general';

export default function searchFMUs(data, searchPhrase, key = 'name') {
  const exactMatchSearch = new Fuse(data, {
    ...SEARCH_OPTIONS,
    keys: [key],
    threshold: 0.0
  });
  const exactMatch = exactMatchSearch.search(searchPhrase);
  if (exactMatch.length) return exactMatch.map(r => r.item);

  const fuzzyMatchSearch = new Fuse(data, {
    ...SEARCH_OPTIONS,
    keys: [key],
    distance: 100,
    threshold: 0.15
  });
  return fuzzyMatchSearch.search(searchPhrase).map(r => r.item);
}
