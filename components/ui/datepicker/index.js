import React from 'react';
import { useIntl } from 'react-intl';

import Component from './component';

const Datepicker = (props) => {
  const { locale } = useIntl();
  return <Component language={locale} {...props} />;
};

export default Datepicker;
