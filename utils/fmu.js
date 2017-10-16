import React from 'react';

const HELPERS_FMU = {
  getCertifications(fmus) {
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
  }
};

export { HELPERS_FMU };
