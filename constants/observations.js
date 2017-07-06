import React from 'react';

const TABS_OBSERVATIONS = [
  {
    label: 'Observations List',
    value: 'observations-list'
  },
  {
    label: 'Map View',
    value: 'map'
  }
];

const TABLE_HEADERS = [
  {
    Header: <span className="sortable">Date</span>,
    accessor: 'date'
  },
  {
    Header: <span className="sortable">Country</span>,
    accessor: 'country',
    className: '-uppercase'
  },
  {
    Header: <span className="sortable">Operator</span>,
    accessor: 'operator',
    className: '-uppercase'
  },
  {
    Header: <span className="sortable">Forest Unit</span>,

    accessor: 'fmu'
  },
  {
    Header: <span className="sortable">Category</span>,
    accessor: 'category'
  },
  {
    Header: <span className="sortable">Detail</span>,
    accessor: 'observation'
  },
  {
    Header: <span className="sortable">Severity</span>,
    accessor: 'level',
    headerClassName: 'severity-th',
    className: 'severity',
    Cell: props => <span className={`severity-item -sev-${props.value}`}>{props.value}</span>
  }
];

const FILTERS_REFS = [
  {
    key: 'types',
    name: 'Type',
    placeholder: 'All Types'
  },
  {
    key: 'country_ids',
    name: 'Country',
    placeholder: 'All Countries'
  },
  {
    key: 'fmu_ids',
    name: 'FMU',
    placeholder: 'All FMUS'
  },
  {
    key: 'years',
    name: 'Year',
    placeholder: 'All Years'
  },
  {
    key: 'observer_ids',
    name: 'Monitor',
    placeholder: 'All Monitors'
  },
  {
    key: 'category_ids',
    name: 'categories',
    placeholder: 'All Categories'
  },
  {
    key: 'severities',
    name: 'Severity',
    placeholder: 'All Severities'
  }
];

export { TABS_OBSERVATIONS, TABLE_HEADERS, FILTERS_REFS };
