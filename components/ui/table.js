import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ReactTable from 'react-table/react-table';

export default function Table({ data, options, className }) {

  // react table has some issue with not changing page number in page navigation when providing
  // new page number when using manual option
  // in this case I will reset this control by rendering null for a milisecond
  // maybe that is stupid but it works
  const [reset, setReset] = useState(false);

  useEffect(() => {
    // only reset if page is set to 0, and options page is set to default value -1
    // that should happen when filters are changed
    if (options.page === 0 && options.manual && options.pages === -1) {
      setReset(true);
      setTimeout(() => setReset(false), 1);
    }
  }, [options.page]);

  if (reset) return null;

  const noData = !options.loading && data && data.length === 0;
  const noDataComponent = () => {
    if (!noData) return null;

    return (
      <div className="c-table__no-data">
        <h3 className="c-title -big">{options.noDataText}</h3>
      </div>
    )
  }

  const classNames = cx({
    [className]: !!className,
    '-no-data': noData
  });

  return (
    <div className={`c-table ${classNames}`}>
      <ReactTable
        data={data}
        className={`table ${classNames}`}
        columns={options.columns}
        defaultPageSize={options.pageSize}
        pageSize={options.pageSize}
        showPagination={options.pagination}
        page={options.page}
        previousText={options.previousText}
        nextText={options.nextText}
        NoDataComponent={noDataComponent}
        pages={options.pages}
        showPageSizeOptions={options.showPageSizeOptions}
        multiSort={options.multiSort !== undefined ? options.multiSort : true}
        sortable={options.sortable !== undefined ? options.sortable : true}
        resizable={false}
        minRows={0}
        loading={options.reactTableLoading}
        // Api pagination & sort
        manual={options.manual}
        onPageChange={options.onPageChange}
        onFetchData={options.onFetchData}
        defaultSorted={options.defaultSorted}
        sorted={options.sorted}
        SubComponent={options.showSubComponent && options.subComponent}
      />
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
