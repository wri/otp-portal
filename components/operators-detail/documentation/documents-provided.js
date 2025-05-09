import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'utils/general';
import { useRouter } from 'next/router';

// Redux
import { connect } from 'react-redux';

// Utils
import { HELPERS_DOC } from 'utils/documentation';

// Components
import { PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';
import ChartLegend from 'components/ui/chart-legend';
import useDeviceInfo from 'hooks/use-device-info';

function DocumentsProvided(props) {
  const { data, user } = props;
  const isMobileAgent = user.userAgent.isMobile;
  const { isMobile, isServer } = useDeviceInfo();
  const router = useRouter();
  const filteredData = data.filter((d) => d.status !== 'doc_not_required');
  const groupedByStatusChart = HELPERS_DOC.getGroupedByStatusChart(
    filteredData
  );
  const legend = omit(HELPERS_DOC.getMetadata(), 'doc_not_required');

  groupedByStatusChart.forEach((item) => {
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
            data={groupedByStatusChart}
            dataKey="value"
            outerRadius={radius}
            innerRadius={radius - 10}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          // If you want to change the labels you should do something similar to this
          // https://github.com/recharts/recharts/blob/master/src/polar/Pie.js#L339
          >
            {groupedByStatusChart.map((entry) => (
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
        list={Object.keys(legend)
          .map((k) => ({ id: k, value: 0, ...legend[k] }))
          .filter((k) => {
            if (
              (user.token && user.role === 'admin') ||
              (user.token &&
                (user.role === 'operator' || user.role === 'holding') &&
                user.operator_ids.includes(+router.query.id))
            ) {
              return true;
            }

            return !k.user;
          })}
        className="-absolute"
      />
    </div>
  );
}

DocumentsProvided.defaultProps = {
  data: [],
};

DocumentsProvided.propTypes = {
  data: PropTypes.array,
  user: PropTypes.object
};

export default connect((state) => ({
  user: state.user
}))(DocumentsProvided);
