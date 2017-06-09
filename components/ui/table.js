import React from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
import ReactTable from 'react-table';
import { TABLE_HEADERS } from 'constants/observations';

const data = [
  {
    date: 2013,
    country: 'bbb',
    operator: 2,
    fmu: 2,
    category: 2,
    observation: 2,
    level: 2
  },
  {
    date: 2011,
    country: 'aaa',
    operator: 2,
    fmu: 2,
    category: 2,
    observation: 2,
    level: 1
  }
];

export default class StaticSection extends React.Component {
  render() {
    return (
      <div className="c-table">
        <ReactTable
          data={data}
          className="table"
          columns={TABLE_HEADERS}
          showPagination={false}
          defaultPageSize={data.length}
        />
      </div>
    );
  }
}

StaticSection.defaultProps = {

};

StaticSection.propTypes = {
  data: PropTypes.object
};
