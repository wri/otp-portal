import React from 'react';
import Fuse from 'fuse.js';

import { HELPERS_DOC } from 'utils/documentation';
import searchFMUs from 'utils/search-fmus';
import { SEARCH_OPTIONS } from 'constants/general';

import OperatorsCertificationsTd from 'components/operators/certificationsTd';

// Ranking rows for the operators that pass the sidebar filters (country, certification, searches)
export function filterRankingRows(operators, filters) {
  const activeCountries = filters.country.length ? filters.country : null;
  const activeCertifications = filters.certification.length ? filters.certification : null;
  const activeOperatorSearch = filters.operator.length ? filters.operator : null;
  const activeFMUSearch = filters.fmu.length ? filters.fmu : null;

  let operatorsTable = operators;

  // Filter by country
  if (activeCountries) {
    operatorsTable = operatorsTable.filter(o => {
      return activeCountries.indexOf(Number(o.country.id)) !== -1;
    });
  }

  // Filter by certification
  if (activeCertifications) {
    operatorsTable = operatorsTable.filter(o => {
      return o.fmus.some(f => {
        return activeCertifications.some(ac => {
          return f[`certification-${ac}`];
        });
      });
    });
  }

  if (activeOperatorSearch) {
    const fuse = new Fuse(operatorsTable, SEARCH_OPTIONS);
    operatorsTable = fuse.search(activeOperatorSearch).map(r => r.item);
  }

  if (activeFMUSearch) {
    operatorsTable = searchFMUs(operatorsTable, activeFMUSearch, 'fmus.name');
  }

  operatorsTable = operatorsTable.map(o => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    certification: <OperatorsCertificationsTd fmus={o.fmus} />,
    ranking: o.ranking,
    score: o.score || 0,
    observations: o.observations,
    obsPerVisit: o['obs-per-visit'],
    documentation: HELPERS_DOC.getPercentage(o),
    fmus: o.fmus,
    fmusLenght: o.fmus ? o.fmus.length : 0,
    country: o.country.name
  }));

  return operatorsTable;
}
