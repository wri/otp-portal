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
    Header: <span className="sortable">Observation</span>,
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

export { TABS_OBSERVATIONS, TABLE_HEADERS };
