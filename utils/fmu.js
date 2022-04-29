import React from 'react';
import Jsona from 'jsona';
import sortBy from 'lodash/sortBy';

const JSONA = new Jsona();

const HELPERS_FMU = {
  getFmusByOperatorId(operatorId, lang) {
    return fetch(`${process.env.OTP_API}/fmus?filter[operator]=${operatorId}&locale=${lang}`, {
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
  }
};

export { HELPERS_FMU };
