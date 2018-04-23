import * as d3 from 'd3';
import 'utils/stacked-timeline';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import classnames from 'classnames';


class StackedTimeline {
  constructor(selector, data) {
    this.$selector = d3.select(selector || 'body');
    this.data = data;
    this.maxLabelCharLength = 40;
    this.init();
  }

  truncate(string) {
    if (string.length < this.maxLabelCharLength) return string;

    return `${string.substr(0, this.maxLabelCharLength)}...`;
  }

  getDataPerRow() {
    const reportIds = uniqBy(this.data.map(row => ({ requiredDocId: row.requiredDocId, label: this.truncate(row.title) })), 'requiredDocId');
    const timeNow = new Date();

    return reportIds.map((reportItem) => {
      const documentedEvents = this.getDocumentedChronologicalEvents(reportItem, timeNow);
      const missingEvents = this.getMissingChronologicalEvents(documentedEvents, timeNow);

      return {
        ...reportItem, events: sortBy([...documentedEvents, ...missingEvents], 'start'), config: { height: 16 }
      };
    });
  }

  getDocumentedChronologicalEvents(reportItem, timeNow) {
    return sortBy(
      this.data.filter(row => row.requiredDocId === reportItem.requiredDocId).map((event) => {
        const customClassName = classnames({
          '-was-valid': event.startDate < timeNow && event.endDate < timeNow
        });

        const formatTime = d3.time.format('%B %d, %Y');

        return {
          start: event.startDate,
          end: event.endDate,
          hoverText: `<h3>${event.title}</h3><p>${formatTime(event.startDate)} - ${formatTime(event.endDate)}</p>`,
          className: `report-item ${customClassName}`
        };
      }), 'end'
    );
  }

  getMissingChronologicalEvents(documentedEvents, timeNow) {
    const missingEvents = [];

    documentedEvents.forEach((event, index, array) => {
      const firstIndex = index === 0;
      const lastIndex = index === array.length - 1;

      // If last event is less then current date
      if (lastIndex && event.end < timeNow) {
        missingEvents.push({
          start: event.end,
          end: timeNow,
          className: 'report-item -not-valid'
        });
      }

      // If first event is after the minimum date
      if (firstIndex && this.minDate !== event.start) {
        missingEvents.push({
          start: this.minDate,
          end: event.start,
          className: 'report-item -not-valid'
        });
      }

      // If there is unaccounted time between events
      if (!lastIndex && event.end < array[index + 1].start) {
        missingEvents.push({
          start: event.end,
          end: array[index + 1].start,
          className: 'report-item -not-valid'
        });
      }
    });

    return missingEvents;
  }

  init() {
    const dates = this.data.map(row => ({ start: row.startDate, end: row.endDate }));
    this.minDate = sortBy(dates, 'start')[0].start;
    this.maxDate = sortBy(dates, 'end').reverse()[0].end;

    const rows = this.getDataPerRow();

    if (rows.length === 0) return;

    const config = rows.map(row => row.config);

    const data = {
      config,
      rows
    };

    const rowHeight = 42;

    const options = {
      data,
      transition: true,
      height: (rows.length * rowHeight) + 60,
      width: this.$selector.node().offsetWidth,
      labelWidth: 400,
      rowHeight,
      xAxisPosition: 'top',
      timeRangeFormat: d3.time.format('%Y')
    };

    this.$selector
      .stackedTimeline(options)
      .minDate(this.minDate)
      .maxDate(this.maxDate);
  }
}

export default StackedTimeline;
