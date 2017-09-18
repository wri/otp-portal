import Jsona from 'jsona';
import sortBy from 'lodash/sortBy';

const JSONA = new Jsona();

const HELPERS_REGISTER = {
  getCountries() {
    return fetch(`${process.env.OTP_API}/countries`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((data) => {
        const dataParsed = JSONA.deserialize(data);

        return {
          options: dataParsed.map(c => ({ label: c.name, value: c.id }))
        };
      });
  },

  getOperatorCertifications() {
    return [
      { label: 'FSC', value: 'fsc' },
      { label: 'PEF', value: 'pef' },
      { label: 'OLB', value: 'olb' }
    ];
  },

  getOperatorTypes() {
    return [
      { label: 'Logging Company', value: 'Logging Company' },
      { label: 'Artisanal', value: 'Artisanal' },
      { label: 'Sawmill', value: 'Sawmill' },
      { label: 'CommunityForest', value: 'CommunityForest' },
      { label: 'ARB1327', value: 'ARB1327' },
      { label: 'PalmOil', value: 'PalmOil' },
      { label: 'Trader', value: 'Trader' },
      { label: 'Company', value: 'Company' }
    ];
  },

  getOperatorFmus(countryId) {
    return fetch(`${process.env.OTP_API}/fmus?country_ids=${countryId}&free=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'OTP-API-KEY': process.env.OTP_API_KEY
      }
    })
      .then((response) => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then((data) => {
        const dataParsed = JSONA.deserialize(data);
        return sortBy(dataParsed.map(f => ({ label: f.name, value: f.id })), 'label');
      });
  },

  getBody(form) {
    const {
      address,
      certification,
      country,
      fmus,
      name,
      operator_type,
      website
    } = form;

    return {
      data: {
        type: 'operators',
        attributes: {
          name,
          'operator-type': operator_type,
          website,
          address,
          certification
        },
        relationships: {
          country: {
            data: {
              type: 'countries',
              id: country
            }
          },
          fmus: {
            data: fmus.map(f => ({ type: 'fmus', id: f }))
          }
        }
      }
    };
  }


};

export { HELPERS_REGISTER };
