import React from 'react';
import PropTypes from 'prop-types';

import { useIntl } from 'react-intl';
import searchFMUs from 'utils/search-fmus';

// import Tooltip from 'rc-tooltip';
// import Icon from 'components/ui/icon';

const TableExpandedRow = ({ operator, fmuSearch }) => {
  const intl = useIntl();
  const formatCertifications = (fmu) => {
    const certifications = [];

    if (fmu['certification-fsc']) certifications.push('FSC');
    if (fmu['certification-olb']) certifications.push('OLB');
    if (fmu['certification-pefc']) certifications.push('PEFC');
    if (fmu['certification-pafc']) certifications.push('PAFC');
    if (fmu['certification-fsc-cw']) certifications.push('FSC-CW');
    if (fmu['certification-tlv']) certifications.push('TLV');
    if (fmu['certification-ls']) certifications.push('LS');
    if (fmu['certification-pbn']) certifications.push('PbN');
    if (!certifications.length) return '';

    return `${certifications.join(', ')}`;
  }

  let fmus = operator.fmus;
  if (fmuSearch.length > 1) {
    fmus = searchFMUs(fmus, fmuSearch);
  }

  return (
    <tr key={`${operator.id}-expanded`} className="c-table-expanded-row">
      <td colSpan="2" />
      <td colSpan="5" className="-ta-right">
        <table>
          <thead>
            <tr>
              <th className="-ta-left">{intl.formatMessage({ id: 'fmu' })}</th>
              <th className="-ta-center -contextual">{intl.formatMessage({ id: 'forest-type' })}</th>
              <th className="-contextual">{intl.formatMessage({ id: 'certifications' })}</th>
              {/* <th className="-contextual">Map</th> */}
            </tr>
          </thead>
          <tbody>
            {fmus.map((fmu) => (
              <tr key={fmu.id}>
                <td className="-ta-left">{fmu.name}</td>
                <td className="-ta-center">
                  {fmu['forest-type'] && intl.formatMessage({ id: fmu['forest-type'] })}
                </td>
                <td>{formatCertifications(fmu)}</td>
                {/* <td>
                  <Tooltip
                    placement="top"
                    overlay="Show on map"
                    overlayClassName="c-tooltip no-pointer-events auto-width"
                  >
                    <button className="show-on-map-btn">
                      <Icon name="icon-location" />
                    </button>
                  </Tooltip>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </td>
    </tr>
  );
}

TableExpandedRow.propTypes = {
  operator: PropTypes.object.isRequired,
  fmuSearch: PropTypes.string
}

export default TableExpandedRow;
