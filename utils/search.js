const MAX_EXACT_MATCHES = 3;

// Prioritise exact (case-insensitive) substring matches on any searched
// key. Fuse's bitap scoring penalises matches far from the start of the
// string, so acronyms at the end (e.g. "SFF" in "Société Forestière
// FANGA (SFF)") rank poorly or fall below the threshold. Cap them so they
// don't crowd out the fuzzy results in the limited list.
export function mergeExactMatches(list, keys, searchText, fuzzyResults) {
  const needle = searchText.trim().toLowerCase();
  const exactMatches = needle
    ? list.filter(item =>
        (keys || []).some((key) => {
          const fieldValue = item[key];
          return typeof fieldValue === 'string' &&
            fieldValue.toLowerCase().includes(needle);
        })
      ).slice(0, MAX_EXACT_MATCHES)
    : [];

  // Exact matches first, then fuzzy results, de-duplicated by id.
  const seen = new Set();
  return [...exactMatches, ...fuzzyResults].filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
