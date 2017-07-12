import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ReactTable from 'react-table';


// Constants
import { TABLE_HEADERS } from 'constants/observations';


export default function Table({ data, options, className }) {
  const classNames = classnames({
    [className]: !!className
  });

  return (
    <div className={`c-table ${classNames}`}>
      {data.length > 0 ?
        <ReactTable
          data={data}
          className={`table ${classNames}`}
          columns={options.columns || TABLE_HEADERS}
          defaultPageSize={options.pageSize}
          pageSize={options.nextPageSize}
          showPagination={options.pagination}
          page={options.page}
          previousText={options.previousText}
          nextText={options.nextText}
          noDataText={options.noDataText}
          pages={options.pages}
          showPageSizeOptions={options.showPageSizeOptions}
          sortable
          resizable={false}
          // Api pagination & sort
          // manual={options.manual}
          onPageChange={options.onPageChange}
        /> :
        <p>No results</p>
      }
    </div>
  );
}

Table.defaultProps = {
  data: [],
  options: {}
};

Table.propTypes = {
  data: PropTypes.array,
  options: PropTypes.object,
  className: PropTypes.string
};
