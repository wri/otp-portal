import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import {
  LegendItemButtonVisibility,
} from '~/components/map/legend';

const CustomLegendItemButtonVisibility = (props) => {
  const { intl, ...rest } = props;
  const { visibility } = rest;
  const tooltipText = intl.formatMessage({ id: visibility ? 'Hide layer' : 'Show layer' });
  const newProps = { ...rest, tooltipText };

  return <LegendItemButtonVisibility {...newProps} />
};

CustomLegendItemButtonVisibility.propTypes = {
  intl: PropTypes.object.isRequired
};

export default injectIntl(CustomLegendItemButtonVisibility);
