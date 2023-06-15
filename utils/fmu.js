import Jsona from 'jsona';
import sortBy from 'lodash/sortBy';

import API from 'services/api';

const JSONA = new Jsona();

const HELPERS_FMU = {
  getFmusByOperatorId(operatorId, lang) {
    return API.get('fmus', { 'filter[operator]': operatorId, locale: lang })
      .then((data) => {
        const dataParsed = JSONA.deserialize(data);
        return sortBy(dataParsed.map(f => ({ label: f.name, value: f.id })), 'label');
      });
  }
};

export { HELPERS_FMU };
