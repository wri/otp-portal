import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import {
  LegendItemButtonInfo,
} from 'vizzuality-components';

const CustomLegendItemButtonInfo = (props) => {
  const { intl, ...rest } = props;

  return <LegendItemButtonInfo {...rest} tooltipText={intl.formatMessage({ id: 'Layer info' })} />
};

CustomLegendItemButtonInfo.propTypes = {
  intl: PropTypes.object.isRequired
};

export default injectIntl(CustomLegendItemButtonInfo);
