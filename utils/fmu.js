import sortBy from 'lodash/sortBy';

import API from 'services/api';

export function getFmusByOperatorId(operatorId, lang) {
  return API.get('fmus', { 'filter[operator]': operatorId, locale: lang })
      .then(({ data }) => {
        return sortBy(data.map(f => ({ label: f.name, value: f.id })), 'label');
      });
}
