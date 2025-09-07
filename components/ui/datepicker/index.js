import { useSelector } from 'react-redux';

import Component from './component';

const DatepickerContainer = (props) => {
  const language = useSelector(state => state.language);
  return <Component {...props} language={language} />;
};

export default DatepickerContainer;
