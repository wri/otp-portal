import React from 'react';

const HELPERS_FMU = {
  getAllCertifications(fmus) {
    const fsc = fmus.filter(f => f['certification-fsc']).length;
    const olb = fmus.filter(f => f['certification-olb']).length;
    const pefc = fmus.filter(f => f['certification-pefc']).length;
    const vlc = fmus.filter(f => f['certification-vlc']).length;
    const vlo = fmus.filter(f => f['certification-vlo']).length;
    const tltv = fmus.filter(f => f['certification-tltv']).length;

    return (
      <div>
        {!!fsc && <p>FSC ({fsc})</p>}
        {!!olb && <p>OLB ({olb})</p>}
        {!!pefc && <p>PEFC ({pefc})</p>}
        {!!vlc && <p>VLC ({vlc})</p>}
        {!!vlo && <p>VLO ({vlo})</p>}
        {!!tltv && <p>TLTV ({tltv})</p>}
      </div>
    );
  },

  getCertifications(fmu) {
    const fsc = fmu['certification-fsc'];
    const olb = fmu['certification-olb'];
    const pefc = fmu['certification-pefc'];
    const vlo = fmu['certification-vlc'];
    const vlc = fmu['certification-vlo'];
    const tltv = fmu['certification-tltv'];

    if (!fsc && !olb && !pefc) {
      return '-';
    }

    const certifications = [
      !!fsc && 'FSC',
      !!olb && 'OLB',
      !!pefc && 'PEFC',
      !!vlc && 'VLC',
      !!vlo && 'VLO',
      !!tltv && 'TLTV'
    ];

    return (
      <div>
        {certifications.filter(c => !!c).join(' - ')}
      </div>
    );
  }


};

export { HELPERS_FMU };
