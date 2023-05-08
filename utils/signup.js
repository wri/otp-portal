import Jsona from 'jsona';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import compact from 'lodash/compact';

import API from 'services/api';

const JSONA = new Jsona();

const HELPERS_REGISTER = {
  getCountries(lang) {
    return API.get('countries', {
      locale: lang,
    })
      .then((data) => {
        const dataParsed = JSONA.deserialize(data);
        return dataParsed.map(c => ({ label: c.name, value: c.id }));
      });
  },

  mapToSelectOptions(collection = []) {
    return sortBy(collection.map(record => ({
      label: record.name,
      value: record.id
    })), 'label');
  },

  getFMUCertificationsValues(fmus) {
    const fmusGroups = groupBy(fmus, 'id');
    Object.keys(fmusGroups).forEach((id) => {
      fmusGroups[id] = compact([
        !!fmusGroups[id][0]['certification-fsc'] && 'fsc',
        !!fmusGroups[id][0]['certification-fsc-cw'] && 'fsc-cw',
        !!fmusGroups[id][0]['certification-ls'] && 'ls',
        !!fmusGroups[id][0]['certification-pafc'] && 'pafc',
        !!fmusGroups[id][0]['certification-pefc'] && 'pefc',
        !!fmusGroups[id][0]['certification-olb'] && 'olb',
        !!fmusGroups[id][0]['certification-tlv'] && 'tlv'
      ]);
    });

    return fmusGroups;
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

  getOperatorFmus(countryId, lang) {
    return fetch(`${process.env.OTP_API}/fmus?filter[country]=${countryId}&filter[free]=true&locale=${lang}`, {
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

  getBody(form, id) {
    const {
      address,
      country,
      details,
      fmus,
      logo,
      name,
      operator_type,
      website
    } = form;

    return {
      data: {
        type: 'operators',
        ...!!id && { id },
        attributes: {
          name,
          details,
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

  getBodyFmu(certification, id) {
    return {
      data: {
        ...!!id && { id },
        type: 'fmus',
        attributes: {
          'certification-fsc': certification.includes('fsc'),
          'certification-fsc-cw': certification.includes('fsc-cw'),
          'certification-ls': certification.includes('ls'),
          'certification-pafc': certification.includes('pafc'),
          'certification-pefc': certification.includes('pefc'),
          'certification-olb': certification.includes('olb'),
          'certification-tlv': certification.includes('tlv')
        }
      }
    };
  }
};

export { HELPERS_REGISTER };
