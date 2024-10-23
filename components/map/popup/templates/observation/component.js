import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

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
      label: intl.formatMessage({ id: 'category' }),
      value: data.category
    },
    {
      label: intl.formatMessage({ id: 'detail' }),
      value: data.observation
    },
    {
      label: intl.formatMessage({ id: 'year' }),
      value: data.date
    },
    data.operator && {
      label: intl.formatMessage({ id: 'operator' }),
      value: (
        data['operator-profile-id'] ? (
          (<Link
            href={`/operators/${data['operator-profile-id']}`}
            passHref
            target="_blank"
            rel="noopener noreferrer">

            {data.operator}

          </Link>)
        ) : data.operator
      )
    },
    data.fmu && {
      label: intl.formatMessage({ id: 'fmu' }),
      value: data.fmu
    },
    {
      label: intl.formatMessage({ id: 'severity' }),
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
      label: intl.formatMessage({ id: 'litigation-status' }),
      value: data['litigation-status']
    },
    {
      label: intl.formatMessage({ id: 'observer-organizations' }),
      value: data['observer-organizations']
    },
    evidence && {
      label: intl.formatMessage({ id: 'evidence' }),
      value: (
        <div className="evidences">
          {Array.isArray(evidence) &&
            evidence.map((v) => (
              <a
                href={v.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-item"
                key={v.attachment.url}
                title={v.name}
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
      label: intl.formatMessage({ id: 'report' }),
      value: (
        <a
          href={data.report}
          target="_blank"
          rel="noopener noreferrer"
          className="report-item"
          title={data['report-title']}
        >
          <Icon className="" name="icon-file-empty" />
        </a>
      )
    }
  ].filter(x => x);

  return (
    <div className="c-layer-popup">
      <h2 className="layer-popup--title">
        {data.subcategory}
      </h2>

      <table className="layer-popup--table">
        <tbody>
          {fields.map(o => (
            <tr
              key={o.label}
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
