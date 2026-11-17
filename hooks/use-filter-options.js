import { useMemo } from 'react';

import { narrowFilterOptions } from 'utils/filter-options';

export default function useFilterOptions(filters, options, rules) {
  return useMemo(() => narrowFilterOptions(filters, options, rules), [filters, options, rules]);
}
