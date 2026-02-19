import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import ReactTable from 'react-table/react-table';

/**
 * Recursively extracts plain text from a React element or primitive.
 */
function extractText(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (node.props) {
    const { children } = node.props;
    if (Array.isArray(children)) return children.map(extractText).join('');
    return extractText(children);
  }
  return '';
}

/**
 * Measures the pixel width of a string using an off-screen canvas.
 * Reuses a single canvas instance for performance.
 */
function measureTextWidth(text, font) {
  if (typeof document === 'undefined') return 0;
  const canvas =
    measureTextWidth._canvas ||
    (measureTextWidth._canvas = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  ctx.font = font;
  return ctx.measureText(text).width;
}

const CELL_PADDING = 28; // horizontal padding added to each column

/**
 * Computes a pixel width for a column based on its header text and the
 * raw accessor values in `data`. Only used when `column.autoWidth === true`.
 *
 * @param {object} column  React Table column definition
 * @param {Array}  data    Table row data
 * @param {string} font    CSS font string used for measurement
 * @returns {number}
 */
function computeAutoWidth(column, data, font) {
  const headerText = extractText(column.Header);
  let max = measureTextWidth(headerText, font);

  if (typeof column.accessor === 'string') {
    const key = column.accessor;
    for (const row of data) {
      const value = row[key];
      if (value != null && (typeof value === 'string' || typeof value === 'number')) {
        const w = measureTextWidth(String(value), font);
        if (w > max) max = w;
      }
    }
  }

  const computed = Math.ceil(max) + CELL_PADDING;
  const minWidth = column.minWidth || 50;
  const maxWidth = column.maxWidth || 1000;

  if (computed < minWidth) return minWidth;
  if (computed > maxWidth) return maxWidth;

  return computed;
}

export default function Table({ data, options, className }) {

  // react table has some issue with not changing page number in page navigation when providing
  // new page number when using manual option
  // in this case I will reset this control by rendering null for a milisecond
  // maybe that is stupid but it works
  const [reset, setReset] = useState(false);
  const tableRef = useRef(null);

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

  const onPageChange = (page) => {
    tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start'});
    if (options.onPageChange) options.onPageChange(page);
  }

  const classNames = cx({
    [className]: !!className,
    '-no-data': noData
  });

  // Resolve auto-width columns before passing to ReactTable.
  // A column opts in by setting `autoWidth: true`. The font string should
  // match the table's body font as closely as possible.
  const AUTO_WIDTH_FONT = 'bold 16px sans-serif';
  const columns = (options.columns || []).map((col) => {
    if (!col.autoWidth) return col;
    const { autoWidth, ...rest } = col;
    return { ...rest, width: computeAutoWidth(col, data || [], AUTO_WIDTH_FONT) };
  });

  return (
    <div ref={tableRef} className={`c-table ${classNames}`}>
      <ReactTable
        data={data}
        className={`table ${classNames}`}
        columns={columns}
        defaultPageSize={options.pageSize}
        pageSize={options.pageSize}
        page={options.page}
        previousText={options.previousText}
        nextText={options.nextText}
        NoDataComponent={noDataComponent}
        pages={options.pages}
        showPageSizeOptions={options.showPageSizeOptions}
        showPagination={options.showPagination}
        multiSort={options.multiSort !== undefined ? options.multiSort : true}
        sortable={options.sortable !== undefined ? options.sortable : true}
        resizable={false}
        minRows={0}
        loading={options.reactTableLoading}
        // Api pagination & sort
        manual={options.manual}
        onPageChange={onPageChange}
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
