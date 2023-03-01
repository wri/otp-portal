import React from 'react';
import { injectIntl, intlShape } from 'react-intl';

import {
  LegendItemButtonVisibility,
} from 'vizzuality-components';

const CustomLegendItemButtonVisibility = (props) => {
  const { intl, ...rest } = props;
  const { visibility } = rest;
  const tooltipText = intl.formatMessage({ id: visibility ? 'Hide layer' : 'Show layer' });
  const newProps = { ...rest, tooltipText };

  return <LegendItemButtonVisibility {...newProps} />
};

CustomLegendItemButtonVisibility.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CustomLegendItemButtonVisibility);
