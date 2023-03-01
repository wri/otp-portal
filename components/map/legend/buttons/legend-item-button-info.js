import React from 'react';
import { injectIntl, intlShape } from 'react-intl';

import {
  LegendItemButtonInfo,
} from 'vizzuality-components';

const CustomLegendItemButtonInfo = (props) => {
  const { intl, ...rest } = props;

  return <LegendItemButtonInfo {...rest} tooltipText={intl.formatMessage({ id: 'Layer info' })} />
};

CustomLegendItemButtonInfo.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CustomLegendItemButtonInfo);
