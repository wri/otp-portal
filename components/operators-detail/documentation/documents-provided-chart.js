import React from 'react';
import PropTypes from 'prop-types';

// Utils
import { STATUSES } from 'utils/documentation';

// Components
import Donut from 'components/ui/donut';
import ChartLegend from 'components/ui/chart-legend';
import useUser from 'hooks/use-user';

const NO_DATA = [];

function DocumentsProvidedChart({ data = NO_DATA, operatorId }) {
  const user = useUser();
  const notVisibleStatuses = [
    'doc_not_required',
    ...(user.canManageOperator(operatorId) ? [] : ['doc_pending', 'doc_invalid'])
  ];
  const legend = [];
  Object.keys(STATUSES).forEach((status) => {
    if (!notVisibleStatuses.includes(status)) {
      legend.push({
        id: status,
        value: data.find((d) => d.id === status)?.value || 0,
        ...STATUSES[status]
      });
    }
  });

  return (
    <div className="c-doc-provided c-chart">
      <Donut data={data.map((d) => ({ ...d, name: d.id }))} innerRatio={0.95}>
        <ChartLegend
          list={legend}
          className="-absolute"
        />
      </Donut>
    </div>
  );
}


DocumentsProvidedChart.propTypes = {
  data: PropTypes.array,
  operatorId: PropTypes.number
};

export default DocumentsProvidedChart;
