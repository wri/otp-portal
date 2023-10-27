import React from 'react';
import PropTypes from 'prop-types';

// Intl
import { useIntl } from 'react-intl';

import Icon from 'components/ui/icon';

const SEVERITY_LEVELS = ['unknown', 'low', 'medium', 'high'];

function parseValue(value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

export default function ObservationPopup({ data }) {
  const intl = useIntl();
  const evidence = parseValue(data.evidence);
  const fields = [
    {
      label: 'Category',
      value: data.category
    },
    data.subcategory && {
      label: 'Subcategory',
      value: data.subcategory
    },
    data.operator && {
      label: 'Producer',
      value: data.operator,
    },
    data['relevant-operators'] && {
      label: 'Relevant producers',
      value: data['relevant-operators'],
    },
    {
      label: 'Country',
      value: data.country
    },
    data.fmu && {
      label: 'FMU',
      value: data.fmu
    },
    {
      label: 'Severity',
      value: (
        <div className="severity">
          <div className={`severity__icon -severity-${data.level || 0}`} />
          <div className="severity__name">
            {intl.formatMessage({ id: SEVERITY_LEVELS[data.level || 0] })}
          </div>
        </div>
      )
    },
    data['litigation-status'] && {
      label: 'Litigation Status',
      value: data['litigation-status']
    },
    {
      label: 'Monitors',
      value: data['observer-organizations']
    },
    evidence && {
      label: 'Evidence',
      value: (
        <div className="evidences">
          {Array.isArray(evidence) &&
            evidence.map((v) => (
              <a
                href={v.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-item"
              >
                <Icon className="" name="icon-file-empty" />
              </a>
            ))}

          {!Array.isArray(evidence) && (
            <span>{evidence}</span>
          )}
        </div>
      )
    },
    data.report && {
      label: 'Report',
      value: (
        <a
          href={data.report}
          target="_blank"
          rel="noopener noreferrer"
          className="report-item"
        >
          <Icon className="" name="icon-file-empty" />
        </a>
      )
    }
  ].filter(x => x);

  return (
    <div className="c-layer-popup">
      <h2 className="layer-popup--title">
        Observation Details
      </h2>

      <p>
        {data.observation}
      </p>

      <table className="layer-popup--table">
        <tbody>
          {fields.map(o => (
            <tr
              key={o.column}
              className="layer-popup--table-item"
            >
              <td className="layer-popup--list-dt">{o.label}:</td>
              <td className="layer-popup--list-dd">{o.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ObservationPopup.propTypes = {
  data: PropTypes.object
};
