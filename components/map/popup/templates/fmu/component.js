import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// Intl
import { injectIntl } from 'react-intl';

class FMUTemplatePopup extends PureComponent {
  static propTypes = {
    layers: PropTypes.array.isRequired,
    intl: PropTypes.object.isRequired
  };

  formatValue = (config, data) => {
    const { column } = config;
    let value = data[column] || '-';

    if (!['fmu_name', 'company_na'].includes(column)) {
      value = this.props.intl.formatMessage({ id: data[column] || '-' });
    }

    return value;
  }

  render() {
    const { layers, intl } = this.props;
    const activeInteractiveLayer = layers.find(l => l.id === 'fmus');
    const { interactionConfig, data } = activeInteractiveLayer;
    const { output } = interactionConfig;
    const { data: fmuData } = data;

    const { id, operator_id: operatorId, company_na: operatorName, observations: fmuObservations } = fmuData;

    return (
      <div className="c-layer-popup">
        <h2 className="layer-popup--title">
          {data.data.fmu_name}
        </h2>

        <table className="layer-popup--table">
          <tbody>
            {output.filter(o => !o.hidden).map(o => (
              <tr
                key={o.column}
                className="layer-popup--table-item"
              >
                <td className="layer-popup--list-dt">{intl.formatMessage({ id: o.label || o.column })}:</td>
                <td className="layer-popup--list-dd">{this.formatValue(o, fmuData)}</td>
              </tr>
              ))}
          </tbody>
        </table>

        {operatorId && operatorName && id &&
          <Link href={`/operators/${operatorId}/documentation?fmuId=${id}`}>
            <a className="c-button -tertiary -fullwidth -ellipsis -small">
              {intl.formatMessage({ id: 'documentation' })}
            </a>
          </Link>
        }

        {id &&
          <Link href={`/operators/${operatorId}/observations?fmuId=${id}`}>
            <a className="c-button -tertiary -fullwidth -ellipsis -small">
              {intl.formatMessage({ id: 'observations' })} ({fmuObservations})
            </a>
          </Link>
        }

        {operatorId &&
          <Link href={`/operators/${operatorId}`}>
            <a className="c-button -tertiary -fullwidth -ellipsis -small">
              {operatorName}
            </a>
          </Link>
        }
      </div>
    );
  }
}

export default injectIntl(FMUTemplatePopup);
