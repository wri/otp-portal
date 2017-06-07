const PALETTE_COLOR_1 = [
  { fill: '#e98300' },
  { fill: '#333333' },
  { fill: '#005b23' },
  { fill: '#9B9B9B' }
];
const PALETTE_COLOR_2 = [
  { fill: '#e98300', stroke: '#e98300' },
  { fill: '#f7f6ed', stroke: '#e98300' },
  { fill: '#005b23', stroke: '#005b23' }
];

const ANIMATION_TIMES = {
  animationBegin: 250,
  animationDuration: 500,
  animationEasing: 'ease-in-out'
};

const LEGEND_SEVERITY = {
  title: 'SEVERITY',
  list: [{
    fill: PALETTE_COLOR_1[0].fill,
    stroke: PALETTE_COLOR_1[0].fill,
    label: 'High'
  }, {
    fill: PALETTE_COLOR_1[1].fill,
    stroke: PALETTE_COLOR_1[1].fill,
    label: 'Medium'
  }, {
    fill: PALETTE_COLOR_1[2].fill,
    stroke: PALETTE_COLOR_1[2].fill,
    label: 'Low'
  }, {
    fill: PALETTE_COLOR_1[3].fill,
    stroke: PALETTE_COLOR_1[3].fill,
    label: 'Unknown'
  }]
};

const LEGEND_DOCUMENTATION = {
  list: [{
    fill: PALETTE_COLOR_2[0].fill,
    stroke: PALETTE_COLOR_2[0].stroke,
    label: 'Not provided'
  }, {
    fill: PALETTE_COLOR_2[1].fill,
    stroke: PALETTE_COLOR_2[1].stroke,
    label: 'Provided (not valid)'
  }, {
    fill: PALETTE_COLOR_2[2].fill,
    stroke: PALETTE_COLOR_2[2].stroke,
    label: 'Provided (valid)'
  }]
};

export { PALETTE_COLOR_1, PALETTE_COLOR_2, ANIMATION_TIMES, LEGEND_SEVERITY, LEGEND_DOCUMENTATION };
