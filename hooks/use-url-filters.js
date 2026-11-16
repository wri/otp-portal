import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

import { encode, decode } from 'utils/general';
import { setUrlParam } from 'utils/url';

// List filters live base64-encoded in ?filters=, so they survive reloads and can be shared.
export default function useUrlFilters() {
  const encoded = useRouter().query.filters;
  const filters = useMemo(() => (encoded ? decode(encoded) : {}), [encoded]);

  const setFilters = useCallback((changed) => {
    const next = { ...filters, ...changed };
    const nonEmpty = Object.fromEntries(Object.entries(next).filter(([, value]) => value && value.length));
    setUrlParam('filters', Object.keys(nonEmpty).length ? encode(nonEmpty) : null);
  }, [filters]);

  return [filters, setFilters];
}
