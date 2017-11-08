import React from 'react';

const HELPERS_FMU = {
  getAllCertifications(fmus) {
    const fsc = fmus.filter(f => f['certification-fsc']).length;
    const olb = fmus.filter(f => f['certification-olb']).length;
    const pefc = fmus.filter(f => f['certification-pefc']).length;

    return (
      <div>
        {!!fsc && <p>FSC ({fsc})</p>}
        {!!olb && <p>OLB ({olb})</p>}
        {!!pefc && <p>PEFC ({pefc})</p>}
      </div>
    );
  },

  getCertifications(fmu) {
    const fsc = fmu['certification-fsc'];
    const olb = fmu['certification-olb'];
    const pefc = fmu['certification-pefc'];

    if (!fsc && !olb && !pefc) {
      return '-';
    }

    const certifications = [
      !!fsc && 'FSC',
      !!olb && 'OLB',
      !!pefc && 'PEFC'
    ];

    return (
      <div>
        {certifications.filter(c => !!c).join(' - ')}
      </div>
    );
  }


};

export { HELPERS_FMU };
