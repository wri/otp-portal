import sortBy from 'lodash/sortBy';

import API from 'services/api';

const HELPERS_FMU = {
  getFmusByOperatorId(operatorId, lang) {
    return API.get('fmus', { 'filter[operator]': operatorId, locale: lang })
      .then(({ data }) => {
        return sortBy(data.map(f => ({ label: f.name, value: f.id })), 'label');
      });
  }
};

export { HELPERS_FMU };
