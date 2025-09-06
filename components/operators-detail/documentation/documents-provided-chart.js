import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'utils/general';

// Utils
import { STATUSES, HELPERS_DOC } from 'utils/documentation';

// Components
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';
import ChartLegend from 'components/ui/chart-legend';
import useDeviceInfo from 'hooks/use-device-info';
import useUser from 'hooks/use-user';

function DocumentsProvidedChart({ data, operatorId }) {
  const user = useUser();
  const isMobileAgent = user.userAgent.isMobile;
  const { isMobile, isServer } = useDeviceInfo();
  const notVisibleStatuses = [
    'doc_not_required',
    ...(user.canManageOperator(operatorId) ? [] : ['doc_pending', 'doc_invalid'])
  ];
  const legend = omit(STATUSES, notVisibleStatuses);

  data.forEach((item) => {
    legend[item.id].value = item.value;
  });

  const smallChart = (isServer && isMobileAgent) || isMobile;
  let chartHeight = smallChart ? 450 : 600;
  const radius = smallChart ? 160 : 200;

  return (
    <div className="c-doc-provided c-chart">
      <ResponsiveContainer height={chartHeight} initialDimension={{ height: chartHeight }}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={radius}
            innerRadius={radius - 10}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          // If you want to change the labels you should do something similar to this
          // https://github.com/recharts/recharts/blob/master/src/polar/Pie.js#L339
          >
            {data.map((entry) => (
              <Cell
                key={entry.label}
                fill={entry.fill}
                stroke={entry.stroke}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <ChartLegend
        list={Object.keys(legend).map((k) => ({ id: k, value: 0, ...legend[k] }))}
        className="-absolute"
      />
    </div>
  );
}

DocumentsProvidedChart.defaultProps = {
  data: [],
};

DocumentsProvidedChart.propTypes = {
  data: PropTypes.array,
  operatorId: PropTypes.number
};

export default DocumentsProvidedChart;
