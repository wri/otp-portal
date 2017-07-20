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
    key: 'observation_type',
    name: 'Type',
    placeholder: 'All Types'
  },
  {
    key: 'country_id',
    name: 'Country',
    placeholder: 'All Countries'
  },
  {
    key: 'years',
    name: 'Year',
    placeholder: 'All Years'
  },
  {
    key: 'observer_id',
    name: 'Monitor',
    placeholder: 'All Monitors'
  },
  {
    key: 'category_id',
    name: 'categories',
    placeholder: 'All Categories'
  },
  {
    key: 'severity_level',
    name: 'Severity',
    placeholder: 'All Severities'
  }
];

export { TABS_OBSERVATIONS, TABLE_HEADERS, FILTERS_REFS };
