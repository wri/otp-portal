
const d3 = require('d3');

(function () {
  d3.selection.prototype.stackedTimeline = function (options) {
          /*
              Options:
              All options are optional - defaults will be used (but data must be set to see anything).
              All options also have getter and setter functions that can be called on the object after instantiation. Setting a value instantly updates the chart and returns the object so chaining is possible.
                  ie: var width = timeline.width();
                      timeline.width(200).displayCurrent(false).maxDate(new Date());

              width (number | default: 1000): The total width of the chart area, including labels.
              height (number | default: 300): The total height of the chart area, including labels and time ranges.
              labelWidth (number | default: 130): The width of the y axis labels section. This is included in the width setting. So chart area width will be (width - labelWidth).
              rowHeight (number | default: 30): The height of each row (ie: y-axis object).
              xAxisPosition (string | default: 'bottom'): One of the following strings, 'bottom', 'top', 'both'. Indicates where the date axis will display.
              dateAxisTickFormat (d3.time.format.multi | default: The default d3.time.format.multi): The tick format to apply to the date axis.
              displayTimeRange (bool | default: true): Whether to display the time range bounds at the start and end of the date axis.
              displayScrollbar (bool | default: true) Whether to display a scrollbar at the edges of the chart indicating that there are more records that are hidden.
              timeRangeFormat (d3.time.format | default: d3.time.format("%a %d %b %Y")): The time format to format the time range strings.
              displayCurrent (bool | default: true): Whether to display the current time as a line on the chart.
              currentDateUTC: (bool | default : false): If the current date should display as UTC
              updateCurrentMs (number | default: 6000): The amount of milliseconds to update the current line if it's displayed.
              limitDatesToData (bool | default: false): Whether to limit panning of the x-axis to the calculated min and max dates specified in the data associated with the chart.
              minDate (date | default: undefined): The minimum date the date axis can be panned to. If limitDatesToData is set to true this value is ignored.
              maxDate (date | default: undefined): The maximum date the date axis can be panned to. If limitDatesToData is set to true this value is ignored.
              transition (bool | default: true): Whether to transition the display of the data. Will transition the width of each rect from 0 to it's width. Transtion will only occur when changing the underlying data, ie: so on initila load or pasing a value to data() setter.
              transitionDuration (number | default: 1000): The millisecond duration of the transition.
              data (object | default: undefined): The data to apply to the chart. Format described below.

              data of the chart is an object with two array properties - config and rows:
              config objects can contain 3 properties - className, height & borderRadius.
              The order in which config objects are defined in the array is important and relates to the row objects events array.
              The below example will set a className on all events at index 0 to be 'a-class' with no border radius set. All events at index 1 will have a className of 'b-class' and a border radius of 10.

              rows defines the actual data.
              Each row entry relates to a y-axis entry.
                  'label': sets the tick label text.
                  'labelIcon': sets a unicode value so you can use an icon font to display an icon. Set the font family using css (text.label-icon).
                  'labelIconClassName': can be set to add extra styles or override existing ones for the label icons on a per row basis.
                  'events': This is an array that must contain a 'start' and 'end' property which are both dates.
                          Optionally it can include 'hoverText' to display in a popup when the event is hovered over.
                          Can also have a 'className' property to override the className set on it in the config object.

              data Example: (obviously needs real dates for start and end).
              {
                  config: [{ className: "a-class", height: "15" }, { className: "b-class", borderRadius: 10, height: "25" }],
                   rows: [
                          {
                              label: "Task ABC",
                              labelIcon: "\uf0ae",
                              events: [{ hoverText: "The first event", start: new Date(), end: new Date() },
                                       { hoverText: "Second level event", start: new Date(), end: new Date() }]
                          },
                          {
                              label: "Person 123",
                              labelIcon: "\uf007",
                              events: [{ hoverText: "first level", start: new Date(), end: new Date() },
                                       { className: "replace-b-class" start: new Date(), end: new Date() }]
                          }]
              }

          */


    options = options || {};

    let timeRangeFormat = options.timeRangeFormat || d3.time.format('%a %d %b %Y');
    let xAxisPosition = options.xAxisPosition || 'bottom';
    let displayTimeRange = options.displayTimeRange !== false;
    let dateAxisTickFormat = options.dateAxisTickFormat;

    let fullWidth = options.width || 1000;
    let fullHeight = options.height || 300;

    let labelWidth = options.labelWidth || 130;
    let rowHeight = options.rowHeight || 30;

    let chartHeight,
      totalRowHeight,
      width,
      margin,
      heightMargin;

    let displayCurrent = options.displayCurrent !== false;
    let updateCurrentMs = options.updateCurrentMs || 6000;
    const currentDateUTC = options.currentDateUTC;
    let displayScrollbar = options.displayScrollbar !== false;

    let limitDatesToData = options.limitDatesToData === true;
    let minDate = options.minDate;
    let maxDate = options.maxDate;

    let transition = options.transition !== false;
    const transitionDuration = options.transitionDuration || 1000;

    let data = options.data || { rows: [] };

    const outerContainer = this;
    const uid = `${this.attr('id')}-${this.attr('class')}`;

    this.style('position', 'relative');
    const container = this.append('svg');


    const svg = container.append('g')
                  .attr('class', 'st-container');

    const clipPath = svg.append('clipPath')
               .attr('id', `${uid}-clip`)
             .append('rect')
               .attr('x', 0)
               .attr('y', 0);

    const yClipPath = svg.append('clipPath')
               .attr('id', `${uid}-yclip`)
             .append('rect')
               .attr('x', 0)
               .attr('y', 0);


    const timeRangeBottom = svg.append('g').attr('class', 'time-range');
    const timeRangeBottomStart = timeRangeBottom.append('text').attr('class', 'time-range-start');
    const timeRangeBottomEnd = timeRangeBottom.append('text').attr('class', 'time-range-end');
    const xaxBottom = svg.append('g')
              .attr('class', 'x axis');

    const timeRangeTop = svg.append('g').attr('class', 'time-range');
    const timeRangeTopStart = timeRangeTop.append('text').attr('class', 'time-range-start');
    const timeRangeTopEnd = timeRangeTop.append('text').attr('class', 'time-range-end');
    const xaxTop = svg.append('g')
              .attr('class', 'x axis');

    const yax = svg.append('g')
              .attr('class', 'y axis')
              .attr('clip-path', `url(#${uid}-yclip)`);

          // append a group to hold the data
    const dataGroup = svg.append('g')
              .attr('class', 'data-group')
              .attr('clip-path', `url(#${uid}-clip)`);

          // append a line for the current date
    const currentLine = svg.append('line')
              .attr('class', 'current-date-line')
              .attr('clip-path', `url(#${uid}-clip)`);

          // append a rect to cover the data area for events
    const rect = svg.append('rect')
              .attr('class', 'pane');

    const hoverDiv = this.append('div')
                  .attr('class', 'hover-div')
                  .style({ display: 'none', position: 'absolute' });

    const scrollbar = this.append('div')
                  .attr('class', 'scrollbar')
                  .style('display', 'none');

    const scrollbarSlider = scrollbar.append('div')
                  .attr('class', 'slider');

    let x,
      xAxisBottom,
      xAxisTop,
      y,
      yCopy,
      yAxis,
      zoom;
    _setData(transition);
    _setCurrentLine();

    function _setDimensions() {
              // get a reference to the current x domain if one has been set
      let ex;
      if (zoom) {
        ex = x.domain();
      }

      margin = {
        top: xAxisPosition === 'both' || xAxisPosition === 'top' ? (displayTimeRange ? 50 : 25) : 0,
        right: 10,
        bottom: xAxisPosition === 'both' || xAxisPosition === 'bottom' ? (displayTimeRange ? 50 : 25) : 0,
        left: labelWidth || 100
      };

      heightMargin = margin.top + margin.bottom;
              // totalRowHeight = rowHeight * data.rows.length;

      width = fullWidth - margin.right - margin.left;

              // fullHeight = (totalRowHeight + heightMargin) > maxHeight ? maxHeight : totalRowHeight + heightMargin;
      chartHeight = fullHeight - heightMargin;

              // if height is set and the total row height doesn't reach the height setting + 1 extra row, add blank rows to the data until it is reached.
              // clear blank rows first
      for (var i = 0, len = data.rows.length; i < len; i++) {
        if (!data.rows[i].label && data.rows[i].events.length === 0) {
          data.rows.splice(i, 1);
          i--;
          len--;
        }
      }

      const dataHeight = (data.rows.length * rowHeight) + rowHeight;
      if (chartHeight > dataHeight) {
        const blankRows = Math.ceil((chartHeight - dataHeight) / rowHeight);
        for (var i = 0; i < blankRows; i++) {
          data.rows.push({ events: [] });
        }
      }

      totalRowHeight = rowHeight * data.rows.length;
      if (chartHeight > totalRowHeight) {
        chartHeight = totalRowHeight;
      }

              // set the dimensions of the elements
      container.attr('height', fullHeight).attr('width', fullWidth);
      svg.attr('transform', `translate(${margin.left},${margin.top})`);
      clipPath.attr('height', chartHeight).attr('width', width);
      yClipPath.attr('height', chartHeight).attr('width', fullWidth - margin.right).attr('transform', `translate(${-margin.left},0)`);
      yax.attr('height', chartHeight);
      dataGroup.attr('height', chartHeight).attr('width', width);
      rect.attr('height', chartHeight).attr('width', width);

      xaxTop.attr('transform', 'translate(0,0)').attr('height', 0).attr('opacity', 0).select('.tick').attr('opacity', 0);
      timeRangeTop.attr('transform', 'translate(0,-25)').attr('height', (margin.top > 0 ? 25 : 0)).attr('width', width).attr('opacity', margin.top > 0 ? 1 : 0).style('display', (margin.top > 0 ? 'block' : 'none'));
      xaxBottom.attr('transform', `translate(0,${chartHeight})`).attr('height', 0).attr('opacity', 0).select('.tick').attr('opacity', 0);
      timeRangeBottom.attr('transform', `translate(0,${chartHeight + 35})`).attr('height', margin.bottom > 0 ? `${25}px` : '0px').attr('width', `${width}px`).attr('opacity', margin.bottom > 0 ? 1 : 0).style('display', (margin.bottom > 0 ? 'block' : 'none'));

      container.selectAll('.time-range .time-range-end').attr('transform', `translate(${width},0)`);

      _setYAxis();
      _setXAxis();

      if (ex && ex[0].toString() !== 'Invalid Date' && ex[1].toString() !== 'Invalid Date') {
                  // reset the current domain to the original one if one was set earlier
        x.domain(ex);
      }
    }

          // #region private methods
    let maxEvents;
    function _setData(trans) {
      if (!data) {
        return;
      }

              // manually set date start and end properties to a actual date object if it is a string. Probably a quicker d3 way to do this instead of just looping and using general javascript new Date();
      for (let i = 0, il = data.rows.length; i < il; i++) {
        for (let j = 0, jl = data.rows[i].events.length; j < jl; j++) {
          const ev = data.rows[i].events[j];
          if (ev.start instanceof String || typeof ev.start === 'string') {
            ev.start = new Date(ev.start);
          }

          if (ev.end instanceof String || typeof ev.end === 'string') {
            ev.end = new Date(ev.end);
          }
        }
      }

      _setDimensions();

      zoom = d3.behavior.zoom()
                     .x(x)
                     .size([width, chartHeight])
                     .on('zoom', _zoom)
                     .on('zoomstart', _zoomStart)
                     .on('zoomend', _zoomEnd);

      rect.call(zoom);

      maxEvents = d3.max(data.rows, d => d.events.length);

      _draw(trans);
    }

    let currentX,
      currentY;
    rect.on('mousemove', (d, e) => {
      const event = d3.event;
      if (currentX == event.clientX && currentY == event.clientY) {
        return;
      }
      currentX = event.clientX;
      currentY = event.clientY;
      rect.style('display', 'none');
      const el = document.elementFromPoint(d3.event.clientX, d3.event.clientY);
      rect.style('display', 'block');

      if (!el || el.tagName !== 'rect') {
        hoverDiv.style('display', 'none');
        return;
      }

      const hoverElement = d3.select(el);
      if (!hoverElement.classed('event-rect') || !hoverElement.attr('data-hover')) {
        hoverDiv.style('display', 'none');
        return;
      }

      hoverDiv.text(hoverElement.attr('data-hover'));
      const ow = hoverDiv[0][0].offsetWidth;

              // calc position of hover
      const topDiff = outerContainer[0][0].offsetTop - document.body.scrollTop;
      const leftDiff = outerContainer[0][0].offsetLeft - document.body.scrollLeft;

      hoverDiv.style({ left: `${(currentX - leftDiff) - (ow / 4)}px`, top: `${(currentY - topDiff) + 25}px`, display: 'block' });
    });

    rect.on('mouseout', (d, e) => {
      hoverDiv.style('display', 'none');
    });

    let yCenter;
    function _setYAxis() {
      const yMin = 0;
      const yMax = data.rows.length;

      y = d3.scale.linear()
                  .domain([yMax, yMin])
                  .range([totalRowHeight, 0]);

      const tickValues = [];
      for (let i = 0, len = data.rows.length; i < len; i++) {
        tickValues.push(i);
      }

      yAxis = d3.svg.axis()
                          .scale(y)
                          .orient('left')
                          .tickSize(-width)
                          .tickValues(tickValues)
                          .tickFormat((d, i) => {
                            if (data.rows[i] && data.rows[i].label) {
                              return data.rows[i].label;
                            }
                          });

      yCopy = y.copy();
      yCenter = rowHeight / 2;
    }


    let xMin,
      xMax;
    function _setXAxis() {
      x = d3.time.scale()
                    .range([0, width]);

      xMin = d3.min(data.rows, d => d3.min(d.events, d => d.start));

      xMax = d3.max(data.rows, d => d3.max(d.events, d => d.end));

      if (minDate && !limitDatesToData) {
        xMin = minDate;
      }

      if (maxDate && !limitDatesToData) {
        xMax = maxDate;
      }

      x.domain([xMin, xMax]);

      if (xAxisPosition === 'both' || xAxisPosition === 'bottom') {
        xAxisBottom = d3.svg.axis().scale(x).orient('bottom').tickSize(-chartHeight, 0).tickPadding(6);
        if (dateAxisTickFormat) {
          xAxisBottom.tickFormat(dateAxisTickFormat);
        }

        xaxBottom.attr('height', 25).attr('opacity', 1).select('.tick').attr('opacity', 1);
      } else {
        xAxisBottom = null;
      }

      if (xAxisPosition === 'both' || xAxisPosition === 'top') {
        xAxisTop = d3.svg.axis().scale(x).orient('top').tickSize(-chartHeight, 0).tickPadding(6);
        if (dateAxisTickFormat) {
          xAxisTop.tickFormat(dateAxisTickFormat);
        }
        xaxTop.attr('height', 25).attr('opacity', 1).select('.tick').attr('opacity', 1);
      } else {
        xAxisTop = null;
      }
    }

    let currentScale;
    let cyt = 0;
    let isZooming = false;
    function _zoomStart() {
      currentScale = zoom.scale();
      isZooming = true;
    }

    function _zoom() {
      const isPanning = d3.event.scale === currentScale;

      const t = d3.event.translate;
      let tx = t[0];
      let ty = t[1];

              // limit panning to the bounds of the y-axis count and/or the specified date bounds
      ty = Math.min(ty, 0);
      ty = Math.max(ty, chartHeight - totalRowHeight);

      if (limitDatesToData || (maxDate || minDate)) {
        const max = (limitDatesToData || maxDate) ? d3.max(x.range()) : Infinity;
        const min = (limitDatesToData || minDate) ? 0 : Infinity;
        tx = Math.max(tx, width - (max * d3.event.scale));
        tx = Math.min(min, tx);
      }

      zoom.translate([tx, ty]);

      if (isPanning) {
                  // if panning manually update the y domain. This is so the y-axis can be panned, but y scale isn't included in the zoom object so that y-axis it doesn't get zoomed in or out.
        y.domain(yCopy.range().map(y => (y - ty) / 1).map(yCopy.invert));
        cyt = ty;

        if (displayScrollbar) {
          _displayOverflowCheck();
        }
      }

      _draw();
    }


    function _zoomEnd() {
              // reset the zoom translate to use the current y translate value that was calculated during the zoom event.
      const t = zoom.translate();
      zoom.translate([t[0], cyt]);
      isZooming = false;

      if (displayScrollbar) {
        _displayOverflowCheck();
      }
    }


    function _displayOverflowCheck() {
      const moreItems = totalRowHeight > chartHeight;
      if (!moreItems) {
        scrollbar.style('display', 'none');
        return;
      }

      const scrollMargin = 3;

      const scrollbarElement = scrollbar[0][0];
      let top = xAxisPosition === 'both' ? (heightMargin / 2) : xAxisPosition === 'bottom' ? 0 : heightMargin;
      top += scrollMargin;
      const scrollHeight = chartHeight - (scrollMargin * 2);

      const left = width + labelWidth - scrollbarElement.offsetWidth - scrollMargin;
      scrollbar.style({ display: 'block', height: `${scrollHeight}px`, top: `${top}px`, left: `${left}px` });

      const sliderElement = scrollbarSlider[0][0];
      const sliderLeft = (scrollbarElement.offsetWidth / 2) - (sliderElement.offsetWidth / 2);
      let sliderHeight = (chartHeight / totalRowHeight) * chartHeight;
      let sliderTop = Math.abs(zoom.translate()[1]) / (totalRowHeight / chartHeight);


      sliderHeight -= (scrollMargin * 4);
      sliderTop += scrollMargin;

      scrollbarSlider.style({ left: `${sliderLeft}px`, height: `${sliderHeight}px`, top: `${sliderTop}px` });
    }


    function _draw(trans) {
      dataGroup.selectAll('g.row').remove();

      let drawRows = [];
              // only draw rows that are in the visible area. Cuts down on DOM elements for performance in very large lists, although it adds an extra loop. Might be a better place to consolidate this loop somewhere else.
      const moreItems = totalRowHeight > chartHeight;
      if (moreItems) {
        const yDom = y.domain();
        const visibleRows = Math.ceil(chartHeight / rowHeight);
        for (var i = 0, len = data.rows.length; i < len; i++) {
          let addRow = true;
                      // check the y-axis to see if it should be drawn
          if (i < yDom[1] - 1) addRow = false; // this is above the visible area
          if (addRow && i >= yDom[1] + visibleRows) addRow = false; // this is below the visible area

          if (addRow) {
            drawRows.push(data.rows[i]);
          } else {
            drawRows.push({ events: [] }); // add an empty row with no elements as it's not visible
          }
        }
      } else {
                  // include all rows
        drawRows = data.rows;
      }

      const rows = dataGroup.selectAll('g.data-group')
                      .data(drawRows);

      rows.enter().append('g')
                      .attr('class', 'row');
      rows.exit().remove();


      for (var idx = 0; idx < maxEvents; idx++) {
        const r = rows.append('rect')
                      .attr('class', (d) => {
                        if (d.events.length > idx) {
                          return `event-rect ${d.events[idx].className ? d.events[idx].className : (data.config && data.config.length > idx && data.config[idx].className) ? data.config[idx].className : ''}`;
                        }
                      })
                      .attr('height', (d) => {
                        if (d.events.length > idx) {
                          return (d.events[idx].height ? d.events[idx].height : (data.config && data.config.length > idx && data.config[idx].height) ? data.config[idx].height : '');
                        }
                      })
                      .attr('x', (d) => {
                        if (d.events.length > idx) {
                          return x(d.events[idx].start);
                        }
                      })
                      .attr('y', function (d, i) {
                        return y(i) + (rowHeight / 2) - (this.getBBox().height / 2);
                      })
                      .attr('width', (d) => {
                        if (d.events.length > idx) {
                          if (!trans && d.events[idx].start <= d.events[idx].end) {
                            const st = x(d.events[idx].start);
                            const en = x(d.events[idx].end);
                            const sc = en - st;
                            return sc;
                          }
                          return 0;
                        }
                      })
                      .attr('rx', (d) => {
                        if (d.events.length > idx) {
                          return d.events[idx].borderRadius ? d.events[idx].borderRadius : (data.config && data.config.length > idx && data.config[idx].borderRadius) ? data.config[idx].borderRadius : 0;
                        }
                      })
                      .attr('ry', (d) => {
                        if (d.events.length > idx) {
                          return d.events[idx].borderRadius ? d.events[idx].borderRadius : (data.config && data.config.length > idx && data.config[idx].borderRadius) ? data.config[idx].borderRadius : 0;
                        }
                      })
                      .attr('data-hover', (d) => {
                        if (d.events.length > idx && d.events[idx].hoverText) {
                          return d.events[idx].hoverText;
                        }
                      });

        if (trans) {
          r.transition().duration(transitionDuration)
                          .attr('width', (d) => {
                            if (d.events.length > idx && d.events[idx].start <= d.events[idx].end) {
                              const st = x(d.events[idx].start);
                              const en = x(d.events[idx].end);
                              const sc = en - st;
                              return sc;
                            }
                          });
        }
      }


      if (xAxisBottom) {
        xaxBottom.call(xAxisBottom);
      }

      if (xAxisTop) {
        xaxTop.call(xAxisTop);
      }

      yax.call(yAxis);

              // center the y axis tick labels
      yax.selectAll('g.tick text')
                      .attr('transform', `translate(-5, ${yCenter})`);


      yax.selectAll('g.tick text.label-icon').remove();
      const yTicks = yax.selectAll('g.tick');

      for (var i = 0, len = data.rows.length; i < len; i++) {
        if (data.rows[i].labelIcon) {
          const labelBB = yTicks[0][i].getBBox();

                      // The 25 and 5 in the translate are arbitrary values that seemed to position the icons well over a different sizes. They may need to be tweaked depending on icon font size and row size of the graph
          d3.select(yTicks[0][i]).append('text').text(data.rows[i].labelIcon)
                          .attr('class', `label-icon${data.rows[i].labelIconClassName ? ` ${data.rows[i].labelIconClassName}` : ''}`)
                          .attr('transform', `translate(${labelBB.x - 25}, ${yCenter + 5})`);
        }
      }

      const xd = x.domain();
      svg.selectAll('.time-range .time-range-start').text(timeRangeFormat(xd[0]));
      svg.selectAll('.time-range .time-range-end').text(timeRangeFormat(xd[1])).attr('transform', function () {
        const bb = this.getBBox();
        return `translate(${width - bb.width},0)`;
      });

      _updateCurrentLine();


      if (displayScrollbar) {
        _displayOverflowCheck();
      }
    }

    let setCurrentIntervalId;
    function _setCurrentLine() {
      if (setCurrentIntervalId > 0) {
        clearInterval(setCurrentIntervalId);
      }
      if (displayCurrent) {
        setCurrentIntervalId = setInterval(() => { _updateCurrentLine(); }, updateCurrentMs);
      }
      _updateCurrentLine();
    }


    function _updateCurrentLine() {
      let currentDate = new Date();
      if (currentDateUTC) {
        currentDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate(), currentDate.getUTCHours(), currentDate.getUTCMinutes(), currentDate.getUTCSeconds());
      }

      const xVal = displayCurrent ? (x(currentDate) ? x(currentDate) : 0) : 0;
      currentLine
                  .attr('x1', xVal)
                  .attr('y1', 0)
                  .attr('x2', xVal)
                  .attr('y2', displayCurrent ? chartHeight : 0);
    }


          // #endregion


          // #region public methods / properties

    function _doZoom(factor) {
      if (!_checkNumberParam('_doZoom', factor)) return;

      const newScale = zoom.scale() * factor;
      const ct = zoom.translate();
      const newX = (ct[0] - width / 2) * factor + width / 2;

      rect.call(zoom
                      .scale(newScale)
                      .translate([newX, ct[1]])
                      .event);
    }

    function _goToDate(date) {
      const ct = zoom.translate();
      const xCurr = x(date);
      const xCenter = width / 2;
      const xTrans = xCenter - xCurr;
      const translateToCenter = [ct[0] + xTrans, ct[1]];
      if (translateToCenter[0] === 0) {
        return;
      }

      rect.call(zoom
                  .translate(translateToCenter)
                  .event);
    }

    function _goToDateRange(start, end) {
              // reset the x domain, then reset the zoom to the x scale
      const cyt = zoom.translate();
      x.domain([start, end]);
      _draw();
      zoom.x(x).translate([0, cyt[1]]);
    }

    function _data(value) {
      if (!arguments.length) return data;
      data = value;
      _setData(transition);
      return this;
    }

    function _displayCurrent(value) {
      if (!arguments.length) return displayCurrent;
      displayCurrent = value;
      _setCurrentLine();
      return this;
    }

    function _updateCurrentMs(value) {
      if (!arguments.length) return updateCurrentMs;
      if (!_checkNumberParam('updateCurrentMs', value)) return;
      updateCurrentMs = value;
      _setCurrentLine();
      return this;
    }

    function _width(value) {
      if (!arguments.length) return fullWidth;
      if (!_checkNumberParam('width', value)) return;
      fullWidth = value;
      const cyt = zoom.translate()[1];
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }

    function _maxHeight(value) {
      if (!arguments.length) return maxHeight;
      if (!_checkNumberParam('maxHeight', value)) return;
      maxHeight = value;
      const cyt = zoom.translate()[1];
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }

    function _height(value) {
      if (!arguments.length) return fullHeight;
      if (!_checkNumberParam('height', value)) return;
      fullHeight = value;
      const cyt = zoom.translate()[1];
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }

    function _rowHeight(value) {
      if (!arguments.length) return rowHeight;
      if (!_checkNumberParam('rowHeight', value)) return;
      rowHeight = value;
      _setData();
      return this;
    }

    function _labelWidth(value) {
      if (!arguments.length) return labelWidth;
      if (!_checkNumberParam('labelWidth', value)) return;
      labelWidth = value;
      _setData();
      return this;
    }

    function _xAxisPosition(value) {
      if (!arguments.length) return xAxisPosition;
      xAxisPosition = value;
      _setData();
      return this;
    }

    function _displayTimeRange(value) {
      if (!arguments.length) return displayTimeRange;
      displayTimeRange = value;
      _setData();
      return this;
    }

    function _timeRangeFormat(value) {
      if (!arguments.length) return timeRangeFormat;
      timeRangeFormat = value;
      _setData();
      return this;
    }


    function _displayScrollbar(value) {
      if (!arguments.length) return displayScrollbar;
      displayScrollbar = value;
      _setData();
      return this;
    }

    function _limitDatesToData(value) {
      if (!arguments.length) return limitDatesToData;
              // if changing the date limit - reset the x domain and maintain y zoom tranlsate
      const cyt = zoom.translate()[1];
      x.domain([xMin, xMax]);
      limitDatesToData = value;
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }

    function _minDate(value) {
      if (!arguments.length) return minDate;
      const cyt = zoom.translate()[1];
      minDate = value;
      x.domain([minDate, xMax]);
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }

    function _maxDate(value) {
      if (!arguments.length) return maxDate;
      const cyt = zoom.translate()[1];
      maxDate = value;
      x.domain([xMin, maxDate]);
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }


    function _dateAxisTickFormat(value) {
      if (!arguments.length) return dateAxisTickFormat;
      const cyt = zoom.translate()[1];
      dateAxisTickFormat = value;
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }

    function _transition(trans) {
      if (!arguments.length) return transition;
      transition = trans;
      return this;
    }

    function _setWidthHeight(width, height) {
      fullWidth = width;
      fullHeight = height;
      const cyt = zoom.translate()[1];
      _setData();
      _resetYZoomTrans(cyt);
      return this;
    }

    function _resetYZoomTrans(yZoomTrans) {
      const zt = zoom.translate();
      zoom.translate([zt[0], yZoomTrans]);
      rect.call(zoom.event);
    }

    function _checkNumberParam(method, val) {
      if (isNaN(val)) {
        console.error(`${method}: argument must be a valid number`);
        return false;
      }
      return true;
    }

          // initialize scrollbar
    if (displayScrollbar) {
      _displayOverflowCheck();
    }

          // #endregion

          // return an object containing public properties/methods. If these are called as setters, ie: pass a value in to set, they return the object to support chaining.
    return {
      data: _data,
      displayCurrent: _displayCurrent,
      updateCurrentMs: _updateCurrentMs,
      zoom: _doZoom,
      goToDate: _goToDate,
      goToDateRange: _goToDateRange,
      width: _width,
      height: _height,
      rowHeight: _rowHeight,
      labelWidth: _labelWidth,
      xAxisPosition: _xAxisPosition,
      displayTimeRange: _displayTimeRange,
      timeRangeFormat: _timeRangeFormat,
      limitDatesToData: _limitDatesToData,
      minDate: _minDate,
      maxDate: _maxDate,
      dateAxisTickFormat: _dateAxisTickFormat,
      transition: _transition,
      displayScrollbar: _displayScrollbar,
      setWidthHeight: _setWidthHeight
    };
  };
}());
