import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import {
  LegendItemButtonOpacity,
} from '~/components/map/legend';

const CustomLegendItemButtonOpacity = (props) => {
  const { intl, ...rest } = props;
  const { visibility, activeLayer } = rest;
  const { opacity } = activeLayer;

  let tooltipText;
  if (!visibility) {
    tooltipText = intl.formatMessage({ id: 'Opacity (disabled)' });
  } else if (typeof opacity !== 'undefined') {
    tooltipText = `${intl.formatMessage({ id: 'Opacity' })} (${Math.round(opacity * 100)}%)`;
  } else {
    tooltipText = intl.formatMessage({ id: 'Opacity' });
  }
  const newProps = {
    ...rest,
    trackStyle: {
      background: '#FFCC00'
    },
    handleStyle: {
      background: '#FFCC00'
    },
    tooltipText
  };

  return <LegendItemButtonOpacity {...newProps} />
};

CustomLegendItemButtonOpacity.propTypes = {
  intl: PropTypes.object.isRequired
};

export default injectIntl(CustomLegendItemButtonOpacity);
