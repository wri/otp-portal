import * as d3 from 'd3';
import truncate from 'lodash/truncate';

// Constants
const TIME_DOMAIN_MODE = 'fit';

class Gantt {
  constructor(selector) {
    // Size
    this.$selector = d3.select(selector || 'body');
    this.margin = { top: 20, right: 40, bottom: 20, left: 200 };
    this.height = this.$selector[0][0].clientHeight - this.margin.top - this.margin.bottom - 5;
    this.width = this.$selector[0][0].clientWidth - this.margin.right - this.margin.left - 5;

    // Domain
    this.timeDomainStart = d3.time.day.offset(new Date(), -3);
    this.timeDomainEnd = d3.time.hour.offset(new Date(), +3);
    this.timeDomainMode = TIME_DOMAIN_MODE;// fixed or fit

    // Data
    this.titles = [];
    this.status = [];
    this.timeFormat = '%H:%M';

    this.initAxis();
  }

  // Utils
  keyFunction = d => d.startDate + d.title + d.endDate;

  rectTransform = d => `translate(${this.x(d.startDate)},${this.y(d.title)})`;

  initTimeDomain = (tasks) => {
    if (this.timeDomainMode === TIME_DOMAIN_MODE) {
      if (tasks === undefined || tasks.length < 1) {
        this.timeDomainStart = d3.time.day.offset(new Date(), -3);
        this.timeDomainEnd = d3.time.hour.offset(new Date(), +3);
        return;
      }
      tasks.sort((a, b) => a.endDate - b.endDate);
      this.timeDomainEnd = tasks[tasks.length - 1].endDate;
      tasks.sort((a, b) => a.startDate - b.startDate);
      this.timeDomainStart = tasks[0].startDate;
    }
  };

  initAxis = () => {
    // Scales
    this.x = d3.time.scale()
               .domain([this.timeDomainStart, this.timeDomainEnd])
               .range([0, this.width])
               .clamp(true);
    this.y = d3.scale.ordinal()
                .domain(this.titles)
                .rangeRoundBands([0, this.height - this.margin.top - this.margin.bottom], 0.1);

    // Axis
    this.xAxis = d3.svg.axis().scale(this.x)
                  .orient('bottom')
                  .ticks(6)
                  .tickFormat(d3.time.format(this.timeFormat))
                  .tickSubdivide(true)
                  .tickSize(0)
                  .tickPadding(8);

    this.yAxis = d3.svg.axis().scale(this.y)
                  .orient('left')
                  .tickFormat(d => truncate(d, {
                    length: 32,
                    separator: ' '
                  }))
                  .tickSize(0)
                  .tickPadding(8);
  };

  gantt = (tasks) => {
    this.initTimeDomain(tasks);
    this.initAxis();

    const svg = this.$selector
      .append('svg')
        .attr('class', 'chart')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
        .attr('class', 'gantt-chart')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    svg.selectAll('.chart')
      .data(tasks, this.keyFunction).enter()
      .append('rect')
        .attr('class', (d) => {
          if (this.status[d.status] == null) { return 'bar'; }
          return `bar ${this.status[d.status]}`;
        })
        .attr('y', 5)
        .attr('transform', this.rectTransform)
        .attr('height', () => this.y.rangeBand() - 10)
        .attr('width', d => (this.x(d.endDate) - this.x(d.startDate)));

    // Add xAxis
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${this.height - this.margin.top - this.margin.bottom})`)
      .transition()
      .call(this.xAxis);

    // Add yAxis
    svg.append('g').attr('class', 'y axis').transition().call(this.yAxis);

    // tooltip
    d3.selectAll('.y.axis>.tick') // gs for all ticks
      .append('title') // append title with text
      .text(d => d);

    return this.gantt;
  }

  setMargin = (value) => {
    if (!arguments.length) { return this.margin; }
    this.margin = value;
    return this.gantt;
  };

  setTimeDomain = (value) => {
    if (!arguments.length) { return [this.timeDomainStart, this.timeDomainEnd]; }
    this.timeDomainStart = +value[0], this.timeDomainEnd = +value[1];
    return this.gantt;
  };

  setTimeDomainMode = (value) => {
    if (!arguments.length) { return this.timeDomainMode; }
    this.timeDomainMode = value;
    return this.gantt;
  };

  setTitles = (value) => {
    if (!arguments.length) { return this.titles; }
    this.titles = value;
    return this.gantt;
  };

  setStatus = (value) => {
    if (!arguments.length) { return this.status; }
    this.status = value;
    return this.gantt;
  };

  setWidth = (value) => {
    if (!arguments.length) { return this.width; }
    this.width = +value;
    return this.gantt;
  };

  setHeight = (value) => {
    if (!arguments.length) { return this.height; }
    this.height = +value;
    return this.gantt;
  };

  setTimeFormat = (value) => {
    if (!arguments.length) { return this.timeFormat; }
    this.timeFormat = value;
    return this.gantt;
  };
}

export default Gantt;
