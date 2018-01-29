import React from 'react';
import PropTypes from 'prop-types';

class CertificationsTd extends React.Component {
  static defaultProps = {
    fmus: []
  };

  static propTypes = {
    fmus: PropTypes.array
  };

  render() {
    const { fmus } = this.props;
    const fsc = fmus.filter(f => f['certification-fsc']).length;
    const olb = fmus.filter(f => f['certification-olb']).length;
    const pefc = fmus.filter(f => f['certification-pefc']).length;
    const vlc = fmus.filter(f => f['certification-vlc']).length;
    const vlo = fmus.filter(f => f['certification-vlo']).length;
    const tltv = fmus.filter(f => f['certification-tltv']).length;

    if (!fsc && !olb && !pefc) {
      return (
        <div className="certifications-td">
          <p>-</p>
        </div>
      );
    }

    return (
      <div className="certifications-td">
        {!!fsc && <p>FSC ({fsc})</p>}
        {!!olb && <p>OLB ({olb})</p>}
        {!!pefc && <p>PEFC ({pefc})</p>}
        {!!vlc && <p>VLC ({vlc})</p>}
        {!!vlo && <p>VLO ({vlo})</p>}
        {!!tltv && <p>TLTV ({tltv})</p>}
      </div>
    );
  }
}


export default CertificationsTd;
