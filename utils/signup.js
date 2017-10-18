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

  getFMUCertifications() {
    return [
      { label: 'FSC', value: 'fsc' },
      { label: 'PEFC', value: 'pefc' },
      { label: 'OLB', value: 'olb' }
    ];
  },

  getOperatorTypes() {
    return [
      { label: 'Logging company', value: 'Logging company' },
      { label: 'Artisanal', value: 'Artisanal' },
      { label: 'Community forest', value: 'Community forest' },
      { label: 'Estate', value: 'Estate' },
      { label: 'Industrial agriculture', value: 'Industrial agriculture' },
      { label: 'Mining company', value: 'Mining company' },
      { label: 'Sawmill', value: 'Sawmill' },
      { label: 'Other', value: 'Other' },
      { label: 'Unknown', value: 'Unknown' }
    ];
  },

  getOperatorFmus(countryId) {
    return fetch(`${process.env.OTP_API}/fmus?filter[country]=${countryId}&filter[free]=true`, {
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
      country,
      fmus,
      logo,
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
          logo,
          address
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
  },

  getBodyFmu(certification) {
    return {
      data: {
        attributes: {
          'certification-fsc': certification.includes('fsc'),
          'certification-pefc': certification.includes('pefc'),
          'certification-olb': certification.includes('olb')
        }
      }
    };
  }
};

export { HELPERS_REGISTER };
