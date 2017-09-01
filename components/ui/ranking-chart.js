import * as d3 from 'd3';

class RankingChart {
  constructor(selector) {
    // Size
    this.$selector = d3.select(selector);
    this.margin = { top: 14, right: 0, bottom: 14, left: 0 };
    this.radio = 4;
    this.height = this.$selector[0][0].clientHeight;
    this.width = this.$selector[0][0].clientWidth;
  }

  /**
   * HELPERS
   * - getMin
   * - getMax
  */
  getMin = data => d3.min(data.map(d => d.value))

  getMax = data => d3.max(data.map(d => d.value))

  getLineY2 = (d) => {
    const $container = d3.select('#operators-ranking')[0][0];
    const $selector = d3.select(`#td-documentation-${d.id}`)[0][0];
    const containerClient = $container.getBoundingClientRect();
    const clientRect = $selector.getBoundingClientRect();

    // TODO: '14' magic number
    const y2 = (clientRect.top - containerClient.top) + 14;
    return (y2 < 0) ? 0 : y2;
  }

  /**
   * DRAW
   * @return {[type]} [description]
  */
  initScales = (data, sortDirection) => {
    this.min = this.getMin(data);
    this.max = this.getMax(data);

    this.domain = (sortDirection === -1) ? [this.max, this.min] : [this.min, this.max];

    this.y = d3.scale.linear()
      .domain(this.domain)
      .range([this.margin.top, this.height - this.margin.top]);
  }

  draw = (data, sortDirection) => {
    this.$selector[0][0].innerHTML = '';
    this.initScales(data, sortDirection);

    const svg = this.$selector
      .append('svg')
        .attr('class', 'ranking')
        .attr('width', this.width)
        .attr('height', this.height);

    // Add groups
    const bg = svg.append('g')
        .attr('class', 'ranking-bg')
        .attr('width', this.width)
        .attr('height', this.height);

    const lines = svg.append('g')
        .attr('class', 'ranking-lines')
        .attr('width', this.width)
        .attr('height', this.height);

    const chart = svg.append('g')
        .attr('class', 'ranking-chart')
        .attr('width', this.width)
        .attr('height', this.height);


    // Add bg line
    bg
      .append('line')
        .attr('x1', this.width - this.radio)
        .attr('y1', () => this.y(this.max))
        .attr('x2', this.width - this.radio)
        .attr('y2', () => this.y(this.min))
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.15)
        .attr('stroke', '#000000');


    // Add lines
    lines.selectAll()
      .data(data)
      .enter()
      .append('line')
        .attr('x1', () => this.width - this.radio)
        .attr('y1', d => this.y(d.value))
        .attr('x2', 0)
        .attr('y2', this.getLineY2)
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.15)
        .attr('stroke', '#000000');


    // Add circles
    chart.selectAll()
      .data(data)
      .enter()
      .append('circle')
        .attr('id', d => d.id)
        .attr('cx', () => this.width - this.radio)
        .attr('cy', d => this.y(d.value))
        .attr('r', this.radio)
        .attr('fill', '#E98300');
  }
}

export default RankingChart;
