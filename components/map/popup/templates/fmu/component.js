import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { connect } from 'react-redux';

import { getOperatorSlug } from 'selectors/operators';

// Intl
import { injectIntl } from 'react-intl';

class FMUTemplatePopup extends PureComponent {
  static propTypes = {
    fmuData: PropTypes.object.isRequired,
    output: PropTypes.array.isRequired,
    operatorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
    const { intl, operatorId, fmuData, output } = this.props;
    const { id, company_na: operatorName, observations: fmuObservations } = fmuData;

    return (
      <div className="c-layer-popup">
        <h2 className="layer-popup--title">
          {fmuData.fmu_name}
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
          <Link
            href={`/operators/${operatorId}/documentation?fmuId=${id}`}
            className="c-button -tertiary -fullwidth -ellipsis -small">

            {intl.formatMessage({ id: 'documentation' })}

          </Link>
        }

        {operatorId && id &&
          <Link
            href={`/operators/${operatorId}/observations?fmuId=${id}`}
            className="c-button -tertiary -fullwidth -ellipsis -small">

            {intl.formatMessage({ id: 'observations' })}({fmuObservations})
          </Link>
        }

        {operatorId &&
          <Link
            href={`/operators/${operatorId}/overview`}
            className="c-button -tertiary -fullwidth -ellipsis -small">

            {operatorName}

          </Link>
        }
      </div>
    );
  }
}

export default connect((state, { layers }) => {
  const { interactionConfig, data } = layers.find(l => l.id === 'fmus');
  const fmuData = data.data;

  return {
    fmuData,
    output: interactionConfig.output,
    // tile properties only carry the numeric operator id
    operatorId: fmuData.operator_id && getOperatorSlug(state, fmuData.operator_id)
  };
})(injectIntl(FMUTemplatePopup));
