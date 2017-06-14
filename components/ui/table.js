import React from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import { TABLE_HEADERS } from 'constants/observations';


export default class StaticSection extends React.Component {
  render() {
    const { data, options } = this.props;

    return (
      <div className="c-table">
        <ReactTable
          data={data}
          className="table"
          columns={TABLE_HEADERS}
          defaultPageSize={options.pageSize}
          showPagination={options.pagination}
          page={options.page}
          previousText={options.previousText}
          nextText={options.nextText}
          noDataText={options.noDataText}
          pages={options.pages}
          showPageSizeOptions={options.showPageSizeOptions}
          sortable
          // Api pagination & sort
          // manual={options.manual}
          // onPageChange={options.onPageChange}
        />
      </div>
    );
  }
}

StaticSection.defaultProps = {

};

StaticSection.propTypes = {
  data: PropTypes.array,
  options: PropTypes.object
};
