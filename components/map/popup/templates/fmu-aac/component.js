import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

// Intl
import { injectIntl } from 'react-intl';

class FMUAACTemplatePopup extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    layers: PropTypes.array
  };

  render() {
    const { layers } = this.props;

    const fmu = layers.find(l => l.id === 'fmusdetail');
    const aac = layers.find(l => l.id === 'aac-cog' || l.id === 'aac-cod' || l.id === 'aac-cmr');

    return (
      <div className="c-layer-popup">
        {!!fmu && <h3>{fmu.data.data.fmu_name}</h3>}

        {!!aac && (!!String(aac.data.data.period_val || '').trim() || aac.data.data.nom_aac) &&
          <ul className="layer-popup--list">
            {!!String(aac.data.data.nom_aac || '').trim() && <li>Name: {aac.data.data.nom_aac}</li>}
            {!!String(aac.data.data.period_val || '').trim() && <li>Period: {aac.data.data.period_val}</li>}
          </ul>
        }
      </div>
    );
  }
}

export default injectIntl(FMUAACTemplatePopup);
