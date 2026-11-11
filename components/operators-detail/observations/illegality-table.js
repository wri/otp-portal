import React from 'react';
import PropTypes from 'prop-types';
import dynamic from 'next/dynamic';

// Intl
import { useIntl } from 'react-intl';

// components
import Accordion from 'components/ui/accordion';
import Table from 'components/ui/table';
import CheckboxGroup from 'components/form/CheckboxGroup';

import { getColumnHeaders } from 'constants/observations-column-headers';

const MapSubComponent = dynamic(() => import('components/ui/map-sub-component'), { ssr: false });

const OBSERVATION_TABLE_COLUMNS = [
  'date',
  'fmu',
  'observation',
  'level',
  'report',
  'evidence',
  'litigation-status',
  'location',
  'observer-organizations',
  'mission-type',
  'operator-type',
  'relevant-operators',
];

const LABEL_IDS = {
  level: 'severity',
  observation: 'detail',
};

const IllegalityTable = ({ data, columns, onChangeColumns, language }) => {
  const intl = useIntl();

  const columnHeaders = getColumnHeaders(intl);
  const tableOptions = OBSERVATION_TABLE_COLUMNS.map((column) => ({
    label: intl.formatMessage({ id: LABEL_IDS[column] || column }),
    value: column,
  }));

  return (
    <>
      <div>
        <Accordion
          defaultOpen={false}
          header={
            <strong>{intl.formatMessage({ id: "Customize Table Content" })}</strong>
          }
        >
          <CheckboxGroup
            className="-inline -light"
            name="observations-columns"
            onChange={onChangeColumns}
            properties={{
              default: columns,
              name: 'observations-columns',
            }}
            options={tableOptions}
          />
        </Accordion>
      </div>
      <Table
        sortable
        className="-light"
        data={data}
        options={{
          showPagination: false,
          showPageSizeOptions: false,
          columns: columnHeaders.filter((header) => columns.includes(header.accessor)),
          showSubComponent: columns.includes('location'),
          subComponent: (row) =>
            columns.includes('location') && (
              <MapSubComponent
                id={row.original.id}
                language={language}
                location={row.original.location}
                level={row.original.level}
              />
            ),
        }}
      />
    </>
  );
};

IllegalityTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChangeColumns: PropTypes.func.isRequired,
  language: PropTypes.string
};

export default IllegalityTable;
