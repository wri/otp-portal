import * as d3 from 'd3';

// Constants
const TIME_DOMAIN_MODE = 'fit';

const Gantt = (selector) => {
  const $selector = d3.select(selector || 'body');

  let margin = { top: 20, right: 40, bottom: 20, left: 150 };
  let height = $selector[0][0].clientHeight - margin.top - margin.bottom - 5;
  let width = $selector[0][0].clientWidth - margin.right - margin.left - 5;


  let timeDomainStart = d3.time.day.offset(new Date(), -3);
  let timeDomainEnd = d3.time.hour.offset(new Date(), +3);
  let timeDomainMode = TIME_DOMAIN_MODE;// fixed or fit
  let taskTypes = [];
  let taskStatus = [];
  let tickFormat = '%H:%M';

  let x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
  let y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], 0.1);
  let xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
	    .tickSize(8).tickPadding(8);
  let yAxis = d3.svg.axis().scale(y).orient('left').tickSize(0);

  // Utils
  const keyFunction = d => d.startDate + d.taskName + d.endDate;
  const rectTransform = d => `translate(${x(d.startDate)},${y(d.taskName)})`;

  const initTimeDomain = (tasks) => {
    if (timeDomainMode === TIME_DOMAIN_MODE) {
      if (tasks === undefined || tasks.length < 1) {
        timeDomainStart = d3.time.day.offset(new Date(), -3);
        timeDomainEnd = d3.time.hour.offset(new Date(), +3);
        return;
      }
      tasks.sort((a, b) => a.endDate - b.endDate);
      timeDomainEnd = tasks[tasks.length - 1].endDate;
      tasks.sort((a, b) => a.startDate - b.startDate);
      timeDomainStart = tasks[0].startDate;
    }
  };

  const initAxis = () => {
    // Scales
    x = d3.time.scale()
               .domain([timeDomainStart, timeDomainEnd])
               .range([0, width])
               .clamp(true);
    y = d3.scale.ordinal()
                .domain(taskTypes)
                .rangeRoundBands([0, height - margin.top - margin.bottom], 0.1);

    // Axis
    xAxis = d3.svg.axis().scale(x)
                  .orient('bottom')
                  .tickFormat(d3.time.format(tickFormat))
                  .tickSubdivide(true)
                  .tickSize(8)
                  .tickPadding(8);

    yAxis = d3.svg.axis().scale(y)
                  .orient('left')
                  .tickSize(0);
  };

  function gantt(tasks) {
    initTimeDomain(tasks);
    initAxis();

    const svg = $selector
      .append('svg')
        .attr('class', 'chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('class', 'gantt-chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    svg.selectAll('.chart')
      .data(tasks, keyFunction).enter()
      .append('rect')
        .attr('rx', 5)
             .attr('ry', 5)
        .attr('class', (d) => {
          if (taskStatus[d.status] == null) { return 'bar'; }
          return taskStatus[d.status];
        })
        .attr('y', 0)
        .attr('transform', rectTransform)
        .attr('height', () => y.rangeBand())
        .attr('width', d => (x(d.endDate) - x(d.startDate)));

    // Add xAxis
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .transition()
      .call(xAxis);

    // Add yAxis
    svg.append('g').attr('class', 'y axis').transition().call(yAxis);

    return gantt;
  }

  gantt.redraw = (tasks) => {
    initTimeDomain();
    initAxis();

    const svg = d3.select('svg');

    const ganttChartGroup = svg.select('.gantt-chart');
    const rect = ganttChartGroup.selectAll('rect').data(tasks, keyFunction);

    rect.enter()
        .insert('rect', ':first-child')
          .attr('rx', 5)
          .attr('ry', 5)
          .attr('class', (d) => {
            if (taskStatus[d.status] == null) { return 'bar'; }
            return taskStatus[d.status];
          })
          .transition()
          .attr('y', 0)
          .attr('transform', rectTransform)
          .attr('height', () => y.rangeBand())
          .attr('width', d => (x(d.endDate) - x(d.startDate)));

    rect.transition()
        .attr('transform', rectTransform)
        .attr('height', () => y.rangeBand())
        .attr('width', d => (x(d.endDate) - x(d.startDate)));

    rect.exit().remove();

    svg.select('.x').transition().call(xAxis);
    svg.select('.y').transition().call(yAxis);

    return gantt;
  };

  gantt.margin = (value) => {
    if (!arguments.length) { return margin; }
    margin = value;
    return gantt;
  };

  gantt.timeDomain = (value) => {
    if (!arguments.length) { return [timeDomainStart, timeDomainEnd]; }
    timeDomainStart = +value[0], timeDomainEnd = +value[1];
    return gantt;
  };

  gantt.timeDomainMode = (value) => {
    if (!arguments.length) { return timeDomainMode; }
    timeDomainMode = value;
    return gantt;
  };

  gantt.taskTypes = (value) => {
    if (!arguments.length) { return taskTypes; }
    taskTypes = value;
    return gantt;
  };

  gantt.taskStatus = (value) => {
    if (!arguments.length) { return taskStatus; }
    taskStatus = value;
    return gantt;
  };

  gantt.width = (value) => {
    if (!arguments.length) { return width; }
    width = +value;
    return gantt;
  };

  gantt.height = (value) => {
    if (!arguments.length) { return height; }
    height = +value;
    return gantt;
  };

  gantt.tickFormat = (value) => {
    if (!arguments.length) { return tickFormat; }
    tickFormat = value;
    return gantt;
  };


  return gantt;
};


export default Gantt;
